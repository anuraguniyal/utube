/**
 * PlayerController - Robust YouTube IFrame Playback & Rewind Engine
 * 
 * Key Architectural Fixes:
 * 1. Native HTML5 Speed Engine for Forward (1.0x - 2.0x): 100% native YouTube playback rates
 *    without any seekTo calls, guaranteeing ZERO stutter, ZERO jitter, and NO looping.
 * 2. Stepped High-Speed Forward (> 2.0x up to 8.0x): Native 2.0x + clean 250ms keyframe leaps.
 * 3. Dedicated Reverse Rewind Engine: 200ms step-interval keyframe seeking with virtual time
 *    interpolation, giving YouTube's decoder enough time (~200ms) to fetch and render each frame.
 * 4. Auto-resume on Reverse Release: When releasing from reverse rewind, seamlessly resumes normal
 *    forward playback from the rewound timestamp.
 */

class PlayerController {
  constructor() {
    this.player = null;
    this.isReady = false;
    
    // Restore last video & timestamp from localStorage
    const lastVideoData = this.loadLastVideoState();
    this.videoId = lastVideoData.videoId || 'LXb3EKWsInQ';
    this.initialStartSeconds = lastVideoData.time || 0;
    this.lastSavedPosition = this.initialStartSeconds;
    
    this.pollInterval = null;
    this.reverseInterval = null;
    this.forwardBoostInterval = null;

    this.virtualTime = this.initialStartSeconds;
    this.lastNativeRate = 1.0;
    this.wasPlayingBeforeReverse = true;
    this.pendingSeekTime = null;
    
    this.state = {
      isPlaying: false,
      currentTime: this.initialStartSeconds,
      duration: 0,
      playbackRate: 1.0,
      continuousSpeed: 1.0,
      volume: 100,
      isMuted: false,
      isReversePlaying: false,
      captions: {
        enabled: true,
        language: 'en',
        fontSize: 1
      },
      bookmarks: []
    };

    this.listeners = new Set();
    this.loadBookmarksFromStorage();
  }

  init(containerId = 'youtubePlayer', onReadyCallback = null) {
    this.containerId = containerId;
    this.onReadyCallback = onReadyCallback;

    if (window.YT && window.YT.Player) {
      this.createYTPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        this.createYTPlayer();
      };

      if (!document.getElementById('yt-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }
  }

  createYTPlayer() {
    try {
      this.player = new YT.Player(this.containerId, {
        videoId: this.videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          cc_load_policy: 1,
          cc_lang_pref: 'en',
          hl: 'en',
          start: this.initialStartSeconds > 0 ? this.initialStartSeconds : 0,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: (event) => {
            this.isReady = true;
            this.state.duration = this.player.getDuration() || 0;
            this.state.volume = this.player.getVolume() || 100;
            this.state.isMuted = this.player.isMuted ? this.player.isMuted() : false;
            
            if (this.initialStartSeconds > 0) {
              try {
                this.player.seekTo(this.initialStartSeconds, true);
                this.state.currentTime = this.initialStartSeconds;
                this.virtualTime = this.initialStartSeconds;
              } catch (e) {}
            }

            if (this.pendingAutoplay) {
              this.pendingAutoplay = false;
              try { this.player.playVideo(); } catch (e) {}
            }

            this.initCaptions();
            this.startPolling();
            if (this.onReadyCallback) this.onReadyCallback();
            this.notifyState();
          },
          onStateChange: (event) => {
            this.handleStateChange(event.data);
          },
          onPlaybackRateChange: (event) => {
            this.state.playbackRate = event.data;
            this.notifyState();
          },
          onError: (event) => {
            console.warn('YouTube Player Error:', event.data);
            this.notifyError(event.data);
          }
        }
      });
    } catch (err) {
      console.error('Failed to create YouTube player:', err);
    }
  }

  handleStateChange(playerState) {
    // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (playerState === 1 || playerState === 3) { // PLAYING or BUFFERING
      this.state.isPlaying = true;
      this.state.duration = this.player.getDuration() || this.state.duration;

      // When switching videos, enforce the pending timestamp seek as soon as the player buffers/plays
      if (typeof this.pendingSeekTime === 'number' && this.pendingSeekTime > 0) {
        const target = this.pendingSeekTime;
        this.pendingSeekTime = null;
        try {
          this.player.seekTo(target, true);
          this.state.currentTime = target;
          this.virtualTime = target;
        } catch (e) {}
      }
    } else if (playerState === 2 || playerState === 0) { // PAUSED / ENDED
      if (!this.state.isReversePlaying) {
        this.state.isPlaying = false;
      }
    } else if (playerState === 5 || playerState === -1) { // CUED / UNSTARTED
      if (!this.state.isReversePlaying) {
        this.state.isPlaying = false;
      }
    }

    // Capture real YouTube video title and author
    try {
      if (this.player && this.player.getVideoData) {
        const vData = this.player.getVideoData();
        if (vData && vData.title) {
          this.state.title = vData.title;
          this.state.author = vData.author;
        }
      }
    } catch (e) {}

    this.saveLastVideoState();
    this.notifyState();
  }

  getVideoData() {
    if (this.isReady && this.player && this.player.getVideoData) {
      try {
        return this.player.getVideoData();
      } catch (e) {}
    }
    return null;
  }

  startPolling() {
    clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      if (!this.isReady || !this.player || !this.player.getCurrentTime) return;

      try {
        if (!this.state.isReversePlaying && !this.forwardBoostInterval) {
          const time = this.player.getCurrentTime() || 0;
          this.state.currentTime = time;
          this.virtualTime = time;

          // Throttled persistence of current video position
          if (this.state.isPlaying && Math.abs(time - this.lastSavedPosition) >= 3) {
            this.lastSavedPosition = time;
            this.saveLastVideoState();
          }
        }

        const dur = this.player.getDuration() || 0;
        if (dur > 0) this.state.duration = dur;

        this.notifyState();
      } catch (e) {}
    }, 50);
  }

  // --- Continuous Speed / Reverse Dispatcher ---

  setContinuousSpeed(speed) {
    if (!this.isReady || !this.player) return;

    this.state.continuousSpeed = speed;

    if (speed < 0) {
      // REVERSE MODE (-1.0x to -8.0x)
      this.stopForwardBoost();
      this.applyReverse(Math.abs(speed));
    } else {
      // FORWARD MODE (+1.0x to +8.0x)
      this.stopReverse();
      this.applyForward(speed);
    }

    this.notifyState();
  }

  // --- REVERSE REWIND ENGINE ---
  applyReverse(speedMagnitude) {
    this.state.isReversePlaying = true;
    this.state.playbackRate = -speedMagnitude;

    // Pause audio/forward stream while rewinding
    if (this.isPlaying()) {
      try {
        this.player.pauseVideo();
      } catch (e) {}
    }

    // Capture starting virtual time
    if (!this.reverseInterval) {
      try {
        const t = this.player.getCurrentTime();
        this.virtualTime = (typeof t === 'number' && !isNaN(t) && t > 0) ? t : this.state.currentTime;
      } catch (e) {
        this.virtualTime = this.state.currentTime;
      }
    }

    clearInterval(this.reverseInterval);

    // 200ms step interval is the proven sweet spot for YouTube iframe seeking
    const stepIntervalMs = 200;
    const stepSeconds = (stepIntervalMs / 1000) * speedMagnitude;

    // Execute first seek immediately
    this.virtualTime = Math.max(0, this.virtualTime - stepSeconds);
    this.state.currentTime = this.virtualTime;
    try {
      this.player.seekTo(this.virtualTime, true);
    } catch (e) {}

    // Run stepped reverse interval
    this.reverseInterval = setInterval(() => {
      this.virtualTime = Math.max(0, this.virtualTime - stepSeconds);
      this.state.currentTime = this.virtualTime;

      if (this.virtualTime <= 0) {
        this.virtualTime = 0;
        this.state.currentTime = 0;
        try {
          this.player.seekTo(0, true);
        } catch (e) {}
        this.stopReverse();
        this.notifyState();
        return;
      }

      try {
        this.player.seekTo(this.virtualTime, true);
      } catch (e) {}

      this.notifyState();
    }, stepIntervalMs);
  }

  stopReverse() {
    if (this.reverseInterval) {
      clearInterval(this.reverseInterval);
      this.reverseInterval = null;
    }
    this.state.isReversePlaying = false;
  }

  // --- FORWARD PLAYBACK ENGINE ---
  applyForward(speed) {
    this.stopReverse();
    this.state.playbackRate = speed;

    // Ensure player is actively playing
    if (!this.isPlaying()) {
      try {
        this.player.playVideo();
      } catch (e) {}
      this.state.isPlaying = true;
    }

    if (speed <= 2.0) {
      // 1.0x to 2.0x: 100% Native YouTube Playback Rates (No seekTo, No Stutter, No Loops!)
      this.stopForwardBoost();

      const nativeRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
      const closest = nativeRates.reduce((prev, curr) =>
        Math.abs(curr - speed) < Math.abs(prev - speed) ? curr : prev
      );

      if (this.lastNativeRate !== closest) {
        this.lastNativeRate = closest;
        try {
          this.player.setPlaybackRate(closest);
        } catch (e) {}
      }
    } else {
      // Speeds > 2.0x (e.g. 3.0x to 8.0x):
      // Set native to 2.0x + clean 250ms keyframe advancement steps
      if (this.lastNativeRate !== 2.0) {
        this.lastNativeRate = 2.0;
        try {
          this.player.setPlaybackRate(2.0);
        } catch (e) {}
      }

      const extraSpeed = speed - 2.0; // multiplier above 2.0x
      const boostIntervalMs = 250;
      const boostStepSeconds = (boostIntervalMs / 1000) * extraSpeed;

      if (!this.forwardBoostInterval) {
        try {
          this.virtualTime = this.player.getCurrentTime() || this.state.currentTime;
        } catch (e) {
          this.virtualTime = this.state.currentTime;
        }
      }

      clearInterval(this.forwardBoostInterval);

      this.forwardBoostInterval = setInterval(() => {
        try {
          const liveTime = this.player.getCurrentTime() || this.virtualTime;
          this.virtualTime = Math.max(this.virtualTime, liveTime) + boostStepSeconds;
        } catch (e) {
          this.virtualTime += boostStepSeconds;
        }

        const dur = this.getDuration();
        if (dur > 0 && this.virtualTime >= dur) {
          this.virtualTime = dur;
          this.seekTo(dur, true);
          this.stopForwardBoost();
          return;
        }

        this.state.currentTime = this.virtualTime;
        try {
          this.player.seekTo(this.virtualTime, true);
        } catch (e) {}

        this.notifyState();
      }, boostIntervalMs);
    }
  }

  stopForwardBoost() {
    if (this.forwardBoostInterval) {
      clearInterval(this.forwardBoostInterval);
      this.forwardBoostInterval = null;
    }
  }

  // --- Restore Normal Playback on Release ---
  restoreNormalPlayback() {
    this.stopReverse();
    this.stopForwardBoost();
    this.state.continuousSpeed = 1.0;
    this.state.playbackRate = 1.0;
    this.lastNativeRate = 1.0;

    try {
      this.player.setPlaybackRate(1.0);
      this.player.playVideo();
      this.state.isPlaying = true;
    } catch (e) {}

    this.notifyState();
  }

  // --- Core Playback Controls ---

  play() {
    this.stopReverse();
    this.stopForwardBoost();
    if (this.isReady && this.player && this.player.playVideo) {
      try {
        this.player.playVideo();
      } catch (e) {
        console.warn('playVideo error:', e);
      }
    } else {
      this.pendingAutoplay = true;
    }
    this.state.isPlaying = true;
    this.notifyState();
  }

  pause() {
    this.stopReverse();
    this.stopForwardBoost();
    if (this.isReady && this.player && this.player.pauseVideo) {
      try {
        this.player.pauseVideo();
      } catch (e) {
        console.warn('pauseVideo error:', e);
      }
    }
    this.state.isPlaying = false;
    this.notifyState();
  }

  togglePlay() {
    let currentlyPlaying = this.state.isPlaying;
    try {
      if (this.isReady && this.player && this.player.getPlayerState) {
        const s = this.player.getPlayerState();
        if (s === 1 || s === 3) {
          currentlyPlaying = true;
        } else if (s === 2 || s === 0 || s === 5 || s === -1) {
          currentlyPlaying = false;
        }
      }
    } catch (e) {}

    if (currentlyPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  isPlaying() {
    return this.state.isPlaying;
  }

  getCurrentTime() {
    return this.state.currentTime;
  }

  getDuration() {
    return this.state.duration;
  }

  getPlaybackRate() {
    return this.state.playbackRate;
  }

  setSpeed(speed) {
    this.setContinuousSpeed(speed);
  }

  // --- Seeking & Stepping ---

  seekTo(seconds, allowSeekAhead = true) {
    if (!this.isReady || !this.player) return;
    let target = Math.max(0, parseFloat(seconds) || 0);
    if (this.state.duration > 0) {
      target = Math.min(this.state.duration, target);
    }
    this.state.currentTime = target;
    this.virtualTime = target;
    try {
      this.player.seekTo(target, allowSeekAhead);
    } catch (e) {}
    this.notifyState();
  }

  seekBy(deltaSeconds) {
    const target = this.getCurrentTime() + deltaSeconds;
    this.seekTo(target, true);
  }

  stepFrame(direction = 1) {
    this.pause();
    const frameTime = 0.0416; // ~1 frame at 24fps
    this.seekBy(direction * frameTime);
  }

  toggleReversePlayback(speedMultiplier = 2.0) {
    if (this.state.isReversePlaying) {
      this.restoreNormalPlayback();
    } else {
      this.applyReverse(speedMultiplier);
    }
  }

  // --- Captions & Subtitles Engine ---

  initCaptions() {
    try {
      if (this.player && this.player.loadModule) {
        this.player.loadModule('captions');
      }
      this.applyCaptionSettings();
    } catch (e) {}
  }

  toggleCaptions() {
    this.state.captions.enabled = !this.state.captions.enabled;
    this.applyCaptionSettings();
    this.notifyState();
    return this.state.captions.enabled;
  }

  setCaptionLanguage(langCode) {
    this.state.captions.language = langCode;
    this.state.captions.enabled = true;
    this.applyCaptionSettings();
    this.notifyState();
  }

  setCaptionFontSize(size) {
    this.state.captions.fontSize = parseInt(size, 10);
    this.applyCaptionSettings();
    this.notifyState();
  }

  applyCaptionSettings() {
    if (!this.isReady || !this.player) return;
    try {
      if (this.state.captions.enabled) {
        if (this.player.loadModule) this.player.loadModule('captions');
        if (this.player.setOption) {
          if (this.state.captions.language && this.state.captions.language !== 'auto') {
            this.player.setOption('captions', 'track', { languageCode: this.state.captions.language });
          } else {
            this.player.setOption('captions', 'track', {});
          }
          this.player.setOption('captions', 'fontSize', this.state.captions.fontSize);
        }
      } else {
        if (this.player.setOption) {
          this.player.setOption('captions', 'track', {});
        }
        if (this.player.unloadModule) {
          this.player.unloadModule('captions');
        }
      }
    } catch (e) {
      console.warn('Caption settings exception:', e);
    }
  }

  // --- Volume & Mute ---

  setVolume(val) {
    if (!this.isReady || !this.player) return;
    val = Math.max(0, Math.min(100, val));
    this.state.volume = val;
    try {
      this.player.setVolume(val);
      if (val > 0 && this.state.isMuted) {
        this.unmute();
      }
    } catch (e) {}
    this.notifyState();
  }

  mute() {
    if (!this.isReady || !this.player) return;
    try {
      this.player.mute();
      this.state.isMuted = true;
    } catch (e) {}
    this.notifyState();
  }

  unmute() {
    if (!this.isReady || !this.player) return;
    try {
      this.player.unMute();
      this.state.isMuted = false;
    } catch (e) {}
    this.notifyState();
  }

  toggleMute() {
    if (this.state.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  // --- Video Loading & URL Parsing ---

  loadVideo(inputUrlOrId, startSeconds = 0) {
    const videoId = this.parseYouTubeId(inputUrlOrId);
    if (!videoId) {
      return { success: false, error: 'Invalid YouTube URL or Video ID' };
    }

    this.videoId = videoId;
    this.stopReverse();
    this.stopForwardBoost();

    const startSec = Math.max(0, parseFloat(startSeconds) || 0);
    this.pendingSeekTime = startSec > 0 ? startSec : null;

    if (this.isReady && this.player && typeof this.player.loadVideoById === 'function') {
      try {
        try {
          this.player.loadVideoById(videoId, startSec);
        } catch (err) {
          this.player.loadVideoById({
            videoId: videoId,
            startSeconds: startSec
          });
        }
        this.state.isPlaying = true;
        this.state.currentTime = startSec;
        this.virtualTime = startSec;
        this.notifyState();
      } catch (e) {
        console.warn('Error loading video by ID:', e);
        try {
          this.player.cueVideoById({
            videoId: videoId,
            startSeconds: startSec
          });
          this.player.playVideo();
        } catch (err) {}
      }
    }

    return { success: true, videoId };
  }

  parseYouTubeId(url) {
    if (!url) return null;
    const str = url.trim();

    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
      return str;
    }

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/v\/|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
      const match = str.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  // --- Bookmarks ---

  addBookmark(label = '', customTitle = '') {
    let time = 0;
    try {
      if (this.player && typeof this.player.getCurrentTime === 'function') {
        time = this.player.getCurrentTime();
      }
    } catch (e) {}

    if (typeof time !== 'number' || isNaN(time) || time < 0) {
      time = this.state.currentTime || this.virtualTime || 0;
    }

    const vId = this.videoId || 'LXb3EKWsInQ';
    const title = customTitle || this.state.title || (typeof document !== 'undefined' && document.getElementById('currentVideoTitle')?.textContent) || `Video: ${vId}`;
    const roundTime = Math.max(0, Math.round(time * 10) / 10);
    const videoUrl = `https://youtu.be/${vId}?t=${Math.floor(roundTime)}`;

    const bookmark = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      videoId: vId,
      videoTitle: title,
      videoUrl: videoUrl,
      time: roundTime,
      label: label || `Marker @ ${this.formatTime(time)}`,
      createdAt: new Date().toISOString()
    };

    if (!Array.isArray(this.state.bookmarks)) {
      this.state.bookmarks = [];
    }

    this.state.bookmarks.unshift(bookmark);
    this.saveBookmarksToStorage();
    this.notifyState();
    return bookmark;
  }

  removeBookmark(id) {
    if (!Array.isArray(this.state.bookmarks)) this.state.bookmarks = [];
    this.state.bookmarks = this.state.bookmarks.filter(b => b && b.id !== id);
    this.saveBookmarksToStorage();
    this.notifyState();
  }

  saveBookmarksToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('utube_bookmarks', JSON.stringify(this.state.bookmarks || []));
      }
    } catch (e) {
      console.warn('Bookmarks save error:', e);
    }
  }

  loadBookmarksFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem('utube_bookmarks');
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            this.state.bookmarks = parsed;
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Bookmarks load error:', e);
    }
    this.state.bookmarks = [];
  }

  // --- Last Video & Session Persistence ---

  saveLastVideoState() {
    try {
      localStorage.setItem('utube_last_video', JSON.stringify({
        videoId: this.videoId,
        time: Math.floor(this.state.currentTime || 0),
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {}
  }

  loadLastVideoState() {
    try {
      const raw = localStorage.getItem('utube_last_video');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.videoId) return parsed;
      }
    } catch (e) {}
    return { videoId: 'LXb3EKWsInQ', time: 0 };
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyState() {
    this.listeners.forEach(cb => {
      try {
        cb(this.state);
      } catch (e) {}
    });
  }

  notifyError(errCode) {
    this.listeners.forEach(cb => {
      try {
        if (cb.onError) cb.onError(errCode);
      } catch (e) {}
    });
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const s = Math.floor(seconds);
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

if (typeof window !== 'undefined') {
  window.PlayerController = PlayerController;
}
