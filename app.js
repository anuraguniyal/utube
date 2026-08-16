/**
 * UTUBE Application Controller
 * Handles UI wiring, keyboard shortcuts, bookmarks, sample cards, and interactive video resizing.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Player & Gesture Engine
  const player = new PlayerController();
  const gestureOverlay = document.getElementById('gestureOverlay');
  const gestureEngine = new GestureEngine(gestureOverlay, player);

  player.init('youtubePlayer', () => {
    console.log('YouTube Player Ready & Controls Engaged');
    updateVideoMetadata();
  });

  // 2. UI Elements Cache
  const urlInput = document.getElementById('urlInput');
  const loadVideoBtn = document.getElementById('loadVideoBtn');
  const pasteBtn = document.getElementById('pasteBtn');

  const playBtn = document.getElementById('playBtn');
  const playBtnIcon = document.getElementById('playBtnIcon');
  const rewindLiveBtn = document.getElementById('rewindLiveBtn');
  
  const jumpBack10Btn = document.getElementById('jumpBack10Btn');
  const jumpBack5Btn = document.getElementById('jumpBack5Btn');
  const jumpFwd5Btn = document.getElementById('jumpFwd5Btn');
  const jumpFwd10Btn = document.getElementById('jumpFwd10Btn');
  
  const prevFrameBtn = document.getElementById('prevFrameBtn');
  const nextFrameBtn = document.getElementById('nextFrameBtn');

  const timelineContainer = document.getElementById('timelineContainer');
  const timelineProgress = document.getElementById('timelineProgress');
  const timelineThumb = document.getElementById('timelineThumb');
  const timelineMarkersTrack = document.getElementById('timelineMarkersTrack');
  const timelineFramePreview = document.getElementById('timelineFramePreview');
  const previewThumbImg = document.getElementById('previewThumbImg');
  const previewThumbDelta = document.getElementById('previewThumbDelta');
  const previewTimeBadge = document.getElementById('previewTimeBadge');

  const timeCurrent = document.getElementById('timeCurrent');
  const timeDuration = document.getElementById('timeDuration');

  const speedPills = document.querySelectorAll('.speed-pill');
  const muteBtn = document.getElementById('muteBtn');
  const muteIcon = document.getElementById('muteIcon');
  const volumeSlider = document.getElementById('volumeSlider');
  const fullscreenBtn = document.getElementById('fullscreenBtn');

  // Captions Elements
  const captionsBtn = document.getElementById('captionsBtn');
  const captionsMenuBtn = document.getElementById('captionsMenuBtn');
  const captionsFlyout = document.getElementById('captionsFlyout');
  const closeCaptionsFlyout = document.getElementById('closeCaptionsFlyout');
  const captionsToggleSwitch = document.getElementById('captionsToggleSwitch');
  const captionLanguageSelect = document.getElementById('captionLanguageSelect');
  const captionSizeGroup = document.getElementById('captionSizeGroup');

  const addBookmarkBtn = document.getElementById('addBookmarkBtn');
  const bookmarksList = document.getElementById('bookmarksList');

  const sampleVideosGrid = document.getElementById('sampleVideosGrid');
  const helpModal = document.getElementById('helpModal');
  const openHelpBtn = document.getElementById('openHelpBtn');
  const closeHelpBtn = document.getElementById('closeHelpBtn');

  // Video Resizing Elements
  const playerTheaterWrapper = document.getElementById('playerTheaterWrapper');
  const videoViewport = document.getElementById('videoViewport');
  const playerResizeHandle = document.getElementById('playerResizeHandle');
  const resizeBadge = document.getElementById('resizeBadge');
  const resizeBadgeText = document.getElementById('resizeBadgeText');

  const sizeCompactBtn = document.getElementById('sizeCompactBtn');
  const sizeStandardBtn = document.getElementById('sizeStandardBtn');
  const sizeCinemaBtn = document.getElementById('sizeCinemaBtn');
  const aspectToggleBtn = document.getElementById('aspectToggleBtn');
  const zoomFillBtn = document.getElementById('zoomFillBtn');
  const recommendationsGrid = document.getElementById('recommendationsGrid') || document.getElementById('sampleVideosGrid');
  const categoryChipsBar = document.getElementById('categoryChipsBar');

  // 3. Render YouTube Recommendations Feed
  let activeCategory = 'All';

  function renderRecommendations() {
    if (!recommendationsGrid || !window.YOUTUBE_RECOMMENDATIONS) return;

    const list = activeCategory === 'All'
      ? window.YOUTUBE_RECOMMENDATIONS
      : window.YOUTUBE_RECOMMENDATIONS.filter(v => v.category.toLowerCase().includes(activeCategory.toLowerCase()) || (activeCategory === 'Trending' && v.views.includes('B')));

    recommendationsGrid.innerHTML = list.map(video => `
      <div class="video-card ${video.id === player.videoId ? 'active' : ''}" data-video-id="${video.id}" title="${video.title}">
        <div class="video-thumb-wrap">
          <img class="video-thumb-img" src="${video.thumbnail}" alt="${video.title}" loading="lazy" />
          <span class="video-duration-badge">${video.duration}</span>
        </div>
        <div class="video-card-body">
          <div class="video-channel-avatar">${video.avatar || '▶'}</div>
          <div class="video-card-details">
            <h4 class="video-card-title">${video.title}</h4>
            <div class="video-card-channel">${video.channel}</div>
            <div class="video-card-meta">
              <span>${video.views}</span>
              <span>•</span>
              <span>${video.published}</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    recommendationsGrid.querySelectorAll('.video-card').forEach(card => {
      card.addEventListener('click', () => {
        const vidId = card.getAttribute('data-video-id');
        loadNewVideo(vidId);
      });
    });
  }

  // Category Filter Chips
  if (categoryChipsBar) {
    categoryChipsBar.querySelectorAll('.topic-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        categoryChipsBar.querySelectorAll('.topic-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCategory = chip.getAttribute('data-category');
        renderRecommendations();
      });
    });
  }

  renderRecommendations();

  function updateActiveCard(activeId) {
    document.querySelectorAll('.video-card').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-video-id') === activeId);
    });
  }

  // Video Title & Metadata Cache
  const videoMetadataCache = new Map();

  async function fetchVideoMetadata(videoId) {
    if (!videoId) return null;
    if (videoMetadataCache.has(videoId)) {
      return videoMetadataCache.get(videoId);
    }

    // 1. Check local recommended dataset
    const dataset = window.YOUTUBE_RECOMMENDATIONS || window.SAMPLE_VIDEOS;
    const localMatch = dataset ? dataset.find(v => v.id === videoId) : null;
    if (localMatch) {
      const meta = { title: localMatch.title, description: localMatch.description, author: localMatch.channel };
      videoMetadataCache.set(videoId, meta);
      return meta;
    }

    // 2. Check YouTube Player API video data
    const ytData = player.getVideoData();
    if (ytData && ytData.title && ytData.video_id === videoId) {
      const meta = {
        title: ytData.title,
        description: ytData.author ? `Uploaded by ${ytData.author}` : 'Enhanced gesture-controlled playback mode.',
        author: ytData.author || ''
      };
      videoMetadataCache.set(videoId, meta);
      return meta;
    }

    // 3. Fetch from official YouTube oEmbed endpoint
    try {
      const resp = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      if (resp.ok) {
        const json = await resp.json();
        if (json && json.title) {
          const meta = {
            title: json.title,
            description: json.author_name ? `Uploaded by ${json.author_name} • YouTube` : 'Enhanced gesture-controlled playback mode.',
            author: json.author_name || ''
          };
          videoMetadataCache.set(videoId, meta);
          return meta;
        }
      }
    } catch (e) {
      console.warn('Could not fetch oEmbed title:', e);
    }

    return { title: `YouTube Video: ${videoId}`, description: 'Enhanced gesture-controlled playback mode.', author: '' };
  }

  async function updateVideoMetadata(customVideoId = null) {
    const vidId = customVideoId || player.videoId;
    const titleEl = document.getElementById('currentVideoTitle');
    const descEl = document.getElementById('currentVideoDesc');

    // Quick initial render
    const dataset = window.YOUTUBE_RECOMMENDATIONS || window.SAMPLE_VIDEOS;
    const local = dataset ? dataset.find(v => v.id === vidId) : null;
    if (local) {
      if (titleEl) titleEl.textContent = local.title;
      if (descEl) descEl.textContent = local.description;
      return;
    }

    if (titleEl) titleEl.textContent = 'Loading video title...';

    // Fetch official real YouTube title
    const meta = await fetchVideoMetadata(vidId);
    if (meta && vidId === player.videoId) {
      if (titleEl) titleEl.textContent = meta.title;
      if (descEl) descEl.textContent = meta.description;
    }
  }

  function loadNewVideo(query) {
    const res = player.loadVideo(query);
    if (res.success) {
      updateActiveCard(res.videoId);
      if (urlInput) urlInput.value = `https://youtu.be/${res.videoId}`;
      
      gestureEngine.showMomentaryFeedback('Loaded Video', 'info');
      updateVideoMetadata(res.videoId);
      renderBookmarks();

      // Scroll smoothly up to the player if user was browsing recommendations below
      if (window.scrollY > 300) {
        playerTheaterWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      gestureEngine.showMomentaryFeedback('Invalid URL / Video ID', 'info');
    }
  }

  // Restore initial video metadata and URL bar on page load
  updateVideoMetadata(player.videoId);
  if (urlInput && player.videoId) {
    urlInput.value = `https://youtu.be/${player.videoId}`;
  }
  updateActiveCard(player.videoId);

  // 4. Video Resizing & Aspect Ratio Controls
  function setPlayerWidth(widthStr, activeBtn = null) {
    playerTheaterWrapper.style.width = widthStr;
    playerTheaterWrapper.style.maxWidth = widthStr;

    [sizeCompactBtn, sizeStandardBtn, sizeCinemaBtn].forEach(b => {
      if (b) b.classList.remove('active');
    });
    if (activeBtn) activeBtn.classList.add('active');

    updateResizeBadge();
  }

  sizeCompactBtn.addEventListener('click', () => {
    setPlayerWidth('720px', sizeCompactBtn);
    gestureEngine.showMomentaryFeedback('Compact Mode (720px)', 'info');
  });

  sizeStandardBtn.addEventListener('click', () => {
    setPlayerWidth('1080px', sizeStandardBtn);
    gestureEngine.showMomentaryFeedback('Standard Mode (1080px)', 'info');
  });

  sizeCinemaBtn.addEventListener('click', () => {
    setPlayerWidth('100%', sizeCinemaBtn);
    gestureEngine.showMomentaryFeedback('Cinema Full Width', 'info');
  });

  let is21by9 = false;
  aspectToggleBtn.addEventListener('click', () => {
    is21by9 = !is21by9;
    videoViewport.classList.toggle('aspect-21-9', is21by9);
    aspectToggleBtn.classList.toggle('active', is21by9);
    gestureEngine.showMomentaryFeedback(is21by9 ? '📐 21:9 Ultrawide Aspect' : '📺 16:9 Standard Aspect', 'info');
    updateResizeBadge();
  });

  let isZoomCover = false;
  zoomFillBtn.addEventListener('click', () => {
    isZoomCover = !isZoomCover;
    videoViewport.classList.toggle('zoom-cover', isZoomCover);
    zoomFillBtn.classList.toggle('active', isZoomCover);
    gestureEngine.showMomentaryFeedback(isZoomCover ? '🔍 Zoom / Fill Crop Mode' : '📦 Fit / Letterbox Mode', 'info');
  });

  function updateResizeBadge() {
    if (!resizeBadge || !resizeBadgeText) return;
    const rect = playerTheaterWrapper.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    const ratio = is21by9 ? '21:9' : '16:9';
    resizeBadgeText.textContent = `${w} × ${h} (${ratio})`;
  }

  // 5. Interactive Drag-to-Resize Handle
  if (playerResizeHandle) {
    let isResizing = false;
    let startResizeX = 0;
    let startWidth = 0;

    playerResizeHandle.addEventListener('pointerdown', (e) => {
      isResizing = true;
      playerResizeHandle.setPointerCapture(e.pointerId);
      playerResizeHandle.classList.add('active');
      resizeBadge.classList.add('active');

      startResizeX = e.clientX;
      startWidth = playerTheaterWrapper.getBoundingClientRect().width;

      e.preventDefault();
      e.stopPropagation();
    });

    window.addEventListener('pointermove', (e) => {
      if (!isResizing) return;
      const deltaX = (e.clientX - startResizeX) * 2; // symmetric expand
      const newWidth = Math.max(480, Math.min(window.innerWidth - 60, startWidth + deltaX));
      
      playerTheaterWrapper.style.width = `${newWidth}px`;
      playerTheaterWrapper.style.maxWidth = `${newWidth}px`;

      updateResizeBadge();
    });

    const stopResize = (e) => {
      if (isResizing) {
        isResizing = false;
        try { playerResizeHandle.releasePointerCapture(e.pointerId); } catch (err) {}
        playerResizeHandle.classList.remove('active');
        setTimeout(() => resizeBadge.classList.remove('active'), 600);
      }
    };

    window.addEventListener('pointerup', stopResize);
    window.addEventListener('pointercancel', stopResize);

    // Double click to reset to standard
    playerResizeHandle.addEventListener('dblclick', () => {
      setPlayerWidth('1080px', sizeStandardBtn);
      gestureEngine.showMomentaryFeedback('Reset to 1080px Standard', 'info');
    });
  }

  // 6. URL & Loader Listeners
  loadVideoBtn.addEventListener('click', () => {
    const val = urlInput.value.trim();
    if (val) loadNewVideo(val);
  });

  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = urlInput.value.trim();
      if (val) loadNewVideo(val);
    }
  });

  if (pasteBtn && navigator.clipboard) {
    pasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        urlInput.value = text;
        loadNewVideo(text);
      } catch (err) {
        gestureEngine.showMomentaryFeedback('Please paste URL in the input box', 'info');
      }
    });
  }

  // YouTube-style Cursor Auto-Hide on Idle Playback
  let cursorIdleTimer = null;
  if (videoViewport) {
    videoViewport.addEventListener('mousemove', () => {
      videoViewport.classList.remove('idle-hide-cursor');
      clearTimeout(cursorIdleTimer);
      if (player.isPlaying()) {
        cursorIdleTimer = setTimeout(() => {
          videoViewport.classList.add('idle-hide-cursor');
        }, 2500);
      }
    });

    videoViewport.addEventListener('mouseleave', () => {
      clearTimeout(cursorIdleTimer);
      videoViewport.classList.remove('idle-hide-cursor');
    });
  }

  // 7. Play / Pause / Reverse Controls
  playBtn.addEventListener('click', (e) => {
    e.preventDefault();
    player.togglePlay();
    setTimeout(() => {
      const isPlaying = player.isPlaying();
      gestureEngine.showMomentaryFeedback(isPlaying ? '▶ Playing' : '⏸ Paused', 'info');
    }, 50);
  });

  rewindLiveBtn.addEventListener('click', () => {
    player.toggleReversePlayback(2.0);
  });

  jumpBack10Btn.addEventListener('click', () => player.seekBy(-10));
  jumpBack5Btn.addEventListener('click', () => player.seekBy(-5));
  jumpFwd5Btn.addEventListener('click', () => player.seekBy(5));
  jumpFwd10Btn.addEventListener('click', () => player.seekBy(10));

  prevFrameBtn.addEventListener('click', () => player.stepFrame(-1));
  nextFrameBtn.addEventListener('click', () => player.stepFrame(1));

  // 8. Timeline Scrubber Interaction & YouTube Frame Viewer
  let isTimelineDragging = false;

  function updateTimelinePosition(e) {
    const rect = timelineContainer.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const dur = player.getDuration() || 0;
    const target = pos * dur;
    player.seekTo(target, true);
  }

  function updateFrameViewer(e) {
    if (!timelineFramePreview) return;
    const rect = timelineContainer.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const dur = player.getDuration() || 0;
    const hoverTime = pos * dur;
    const currentTime = player.getCurrentTime() || 0;

    // Position preview card horizontally with boundary clamping
    const cardHalfWidth = 80;
    const pxPos = pos * rect.width;
    const clampedPx = Math.max(cardHalfWidth, Math.min(rect.width - cardHalfWidth, pxPos));
    timelineFramePreview.style.left = `${clampedPx}px`;

    // Update timestamp badge
    if (previewTimeBadge) {
      previewTimeBadge.textContent = player.formatTime(hoverTime);
    }

    // Update relative time delta
    if (previewThumbDelta) {
      const deltaSec = Math.round(hoverTime - currentTime);
      const sign = deltaSec >= 0 ? '+' : '';
      previewThumbDelta.textContent = `${sign}${deltaSec}s`;
      previewThumbDelta.style.color = deltaSec >= 0 ? '#34d399' : '#fb7185';
    }

    // Dynamic Storyboard Frame Selection
    if (previewThumbImg && player.videoId) {
      let frameIndex = 0;
      if (pos < 0.20) frameIndex = 0;
      else if (pos < 0.45) frameIndex = 1;
      else if (pos < 0.70) frameIndex = 2;
      else frameIndex = 3;

      const frameUrl = `https://img.youtube.com/vi/${player.videoId}/${frameIndex}.jpg`;
      if (previewThumbImg.src !== frameUrl) {
        previewThumbImg.src = frameUrl;
      }
    }
  }

  timelineContainer.addEventListener('pointerdown', (e) => {
    isTimelineDragging = true;
    timelineContainer.classList.add('dragging');
    timelineContainer.setPointerCapture(e.pointerId);
    updateTimelinePosition(e);
    updateFrameViewer(e);
  });

  timelineContainer.addEventListener('pointermove', (e) => {
    updateFrameViewer(e);
    if (isTimelineDragging) {
      updateTimelinePosition(e);
    }
  });

  timelineContainer.addEventListener('pointerup', (e) => {
    if (isTimelineDragging) {
      isTimelineDragging = false;
      timelineContainer.classList.remove('dragging');
      try {
        timelineContainer.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  });

  timelineContainer.addEventListener('pointercancel', () => {
    isTimelineDragging = false;
    timelineContainer.classList.remove('dragging');
  });

  // 9. Speed Pills
  speedPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const speed = parseFloat(pill.getAttribute('data-speed'));
      player.setSpeed(speed);
      gestureEngine.showMomentaryFeedback(`Speed: ${speed}x`, 'info');
    });
  });

  // 10. Volume & Mute
  muteBtn.addEventListener('click', () => {
    player.toggleMute();
  });

  volumeSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    player.setVolume(val);
  });

  // 11. Captions & Options
  if (captionsBtn) {
    captionsBtn.addEventListener('click', () => {
      const enabled = player.toggleCaptions();
      gestureEngine.showMomentaryFeedback(enabled ? '💬 Captions ON' : 'Captions OFF', 'info');
    });
  }

  if (captionsMenuBtn && captionsFlyout) {
    captionsMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      captionsFlyout.classList.toggle('active');
    });

    if (closeCaptionsFlyout) {
      closeCaptionsFlyout.addEventListener('click', (e) => {
        e.stopPropagation();
        captionsFlyout.classList.remove('active');
      });
    }

    document.addEventListener('click', (e) => {
      if (!captionsFlyout.contains(e.target) && e.target !== captionsMenuBtn && !captionsMenuBtn.contains(e.target)) {
        captionsFlyout.classList.remove('active');
      }
    });
  }

  if (captionsToggleSwitch) {
    captionsToggleSwitch.addEventListener('change', (e) => {
      if (e.target.checked !== player.state.captions.enabled) {
        player.toggleCaptions();
      }
    });
  }

  if (captionLanguageSelect) {
    captionLanguageSelect.addEventListener('change', (e) => {
      player.setCaptionLanguage(e.target.value);
      gestureEngine.showMomentaryFeedback(`Language: ${captionLanguageSelect.options[captionLanguageSelect.selectedIndex].text}`, 'info');
    });
  }

  if (captionSizeGroup) {
    captionSizeGroup.querySelectorAll('.toggle-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        captionSizeGroup.querySelectorAll('.toggle-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const size = pill.getAttribute('data-size');
        player.setCaptionFontSize(size);
        gestureEngine.showMomentaryFeedback(`Caption Size: ${pill.textContent}`, 'info');
      });
    });
  }

  // 12. Fullscreen
  fullscreenBtn.addEventListener('click', () => {
    const theater = document.querySelector('.player-theater-wrapper');
    if (!document.fullscreenElement) {
      theater.requestFullscreen().catch(err => {});
    } else {
      document.exitFullscreen().catch(err => {});
    }
  });

  // 12. Bookmarks & Markers
  const copyCurrentTimeBtn = document.getElementById('copyCurrentTimeBtn');
  const copyCurrentTimeIcon = document.getElementById('copyCurrentTimeIcon');
  const addBookmarkCardBtn = document.getElementById('addBookmarkCardBtn');

  function handleAddBookmark() {
    try {
      const bm = player.addBookmark();
      renderBookmarks();
      gestureEngine.showMomentaryFeedback(`⭐ Marked @ ${player.formatTime(bm.time)}`, 'info');
    } catch (e) {
      console.warn('Bookmark add error:', e);
    }
  }

  if (addBookmarkBtn) addBookmarkBtn.addEventListener('click', handleAddBookmark);
  if (addBookmarkCardBtn) addBookmarkCardBtn.addEventListener('click', handleAddBookmark);

  if (copyCurrentTimeBtn) {
    copyCurrentTimeBtn.addEventListener('click', async () => {
      const curTime = Math.floor(player.getCurrentTime() || 0);
      const url = `https://youtu.be/${player.videoId}?t=${curTime}`;
      try {
        await navigator.clipboard.writeText(url);
        if (copyCurrentTimeIcon) copyCurrentTimeIcon.textContent = '✓';
        gestureEngine.showMomentaryFeedback(`📋 Copied URL @ ${player.formatTime(curTime)} (t=${curTime}s)`, 'info');
        setTimeout(() => {
          if (copyCurrentTimeIcon) copyCurrentTimeIcon.textContent = '🔗';
        }, 2000);
      } catch (err) {
        prompt('Copy YouTube Timestamp URL:', url);
      }
    });
  }

  function renderBookmarks() {
    if (!bookmarksList) return;
    const currentVideoBookmarks = player.state.bookmarks.filter(b => b.videoId === player.videoId);

    if (currentVideoBookmarks.length === 0) {
      bookmarksList.innerHTML = `<div style="color: var(--text-dim); font-size: 0.8rem; text-align: center; padding: 1rem;">No markers saved for this video yet. Click "⭐ Mark Time" to save one!</div>`;
      renderTimelineMarkers();
      return;
    }

    bookmarksList.innerHTML = currentVideoBookmarks.map(bm => `
      <div class="bookmark-item">
        <div class="bookmark-left" data-time="${bm.time}" title="Click to jump to ${player.formatTime(bm.time)}">
          <span class="bookmark-time-tag">${player.formatTime(bm.time)}</span>
          <span class="bookmark-label">${bm.label}</span>
        </div>
        <div class="bookmark-actions">
          <button class="btn-icon copy-marker-btn" data-time="${bm.time}" data-vid="${bm.videoId || player.videoId}" title="Copy YouTube Timestamp Link">
            <span class="marker-copy-icon">🔗</span>
          </button>
          <button class="btn-icon delete-marker-btn" data-id="${bm.id}" title="Remove Marker" style="color: #f87171;">
            ✕
          </button>
        </div>
      </div>
    `).join('');

    bookmarksList.querySelectorAll('.bookmark-left').forEach(el => {
      el.addEventListener('click', () => {
        const time = parseFloat(el.getAttribute('data-time'));
        player.seekTo(time, true);
        gestureEngine.showMomentaryFeedback(`Jumped to ${player.formatTime(time)}`, 'info');
      });
    });

    // Copy Marker Timestamp URL
    bookmarksList.querySelectorAll('.copy-marker-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const time = Math.floor(parseFloat(btn.getAttribute('data-time')));
        const vid = btn.getAttribute('data-vid') || player.videoId;
        const timestampUrl = `https://youtu.be/${vid}?t=${time}`;

        try {
          await navigator.clipboard.writeText(timestampUrl);
          const icon = btn.querySelector('.marker-copy-icon');
          if (icon) icon.textContent = '✓';
          gestureEngine.showMomentaryFeedback(`📋 Copied: youtu.be/${vid}?t=${time}s`, 'info');
          setTimeout(() => {
            if (icon) icon.textContent = '🔗';
          }, 2000);
        } catch (err) {
          prompt('Copy timestamp URL:', timestampUrl);
        }
      });
    });

    // Delete Marker
    bookmarksList.querySelectorAll('.delete-marker-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        player.removeBookmark(id);
        renderBookmarks();
        gestureEngine.showMomentaryFeedback('Marker removed', 'info');
      });
    });

    renderTimelineMarkers();
  }

  function renderTimelineMarkers() {
    if (!timelineMarkersTrack) return;
    const dur = player.getDuration() || player.state.duration || 0;
    const currentVideoBookmarks = player.state.bookmarks.filter(b => b.videoId === player.videoId);

    if (dur <= 0 || currentVideoBookmarks.length === 0) {
      timelineMarkersTrack.innerHTML = '';
      return;
    }

    timelineMarkersTrack.innerHTML = currentVideoBookmarks.map(bm => {
      const pct = Math.max(0, Math.min(100, (bm.time / dur) * 100));
      return `
        <div class="timeline-marker-dot" style="left: ${pct}%;" data-time="${bm.time}" title="${bm.label}">
          <div class="marker-hover-tip">⭐ ${bm.label} (${player.formatTime(bm.time)})</div>
        </div>
      `;
    }).join('');

    timelineMarkersTrack.querySelectorAll('.timeline-marker-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const time = parseFloat(dot.getAttribute('data-time'));
        player.seekTo(time, true);
        gestureEngine.showMomentaryFeedback(`⭐ Jumped to bookmark @ ${player.formatTime(time)}`, 'info');
      });
    });
  }

  renderBookmarks();

  // 13. Player State Observer / UI Sync
  player.subscribe((state) => {
    if (playBtnIcon) {
      playBtnIcon.innerHTML = state.isPlaying
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
    }

    rewindLiveBtn.classList.toggle('active', state.isReversePlaying);

    if (timeCurrent) timeCurrent.textContent = player.formatTime(state.currentTime);
    if (timeDuration) timeDuration.textContent = player.formatTime(state.duration);

    if (state.duration > 0 && !isTimelineDragging) {
      const pct = (state.currentTime / state.duration) * 100;
      timelineProgress.style.width = `${pct}%`;
      timelineThumb.style.left = `${pct}%`;
      renderTimelineMarkers();
    }

    speedPills.forEach(pill => {
      const s = parseFloat(pill.getAttribute('data-speed'));
      pill.classList.toggle('active', Math.abs(s - state.playbackRate) < 0.05);
    });

    if (muteIcon) {
      muteIcon.textContent = (state.isMuted || state.volume === 0) ? '🔇' : (state.volume > 50 ? '🔊' : '🔉');
    }
    if (volumeSlider && document.activeElement !== volumeSlider) {
      volumeSlider.value = state.isMuted ? 0 : state.volume;
    }

    if (captionsBtn && state.captions) {
      captionsBtn.classList.toggle('active', state.captions.enabled);
    }
    if (captionsToggleSwitch && state.captions) {
      captionsToggleSwitch.checked = state.captions.enabled;
    }
    if (captionLanguageSelect && state.captions && document.activeElement !== captionLanguageSelect) {
      captionLanguageSelect.value = state.captions.language || 'en';
    }

    if (state.title) {
      const titleEl = document.getElementById('currentVideoTitle');
      if (titleEl && (titleEl.textContent.startsWith('Loading') || titleEl.textContent.startsWith('YouTube Video'))) {
        titleEl.textContent = state.title;
      }
    }
  });

  // 15. Help Modal
  openHelpBtn.addEventListener('click', () => {
    helpModal.classList.add('active');
  });

  closeHelpBtn.addEventListener('click', () => {
    helpModal.classList.remove('active');
  });

  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      helpModal.classList.remove('active');
    }
  });

  // 16. Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

    switch (e.key.toLowerCase()) {
      case ' ':
        e.preventDefault();
        player.togglePlay();
        break;
      case 'c':
        e.preventDefault();
        const enabled = player.toggleCaptions();
        gestureEngine.showMomentaryFeedback(enabled ? '💬 Captions ON' : 'Captions OFF', 'info');
        break;
      case 'j':
        e.preventDefault();
        player.stepFrame(-1);
        gestureEngine.showMomentaryFeedback('◀ Frame Back (J)', 'info');
        break;
      case 'k':
        e.preventDefault();
        player.stepFrame(1);
        gestureEngine.showMomentaryFeedback('Frame Forward ▶ (K)', 'info');
        break;
      case 'l':
        e.preventDefault();
        player.seekBy(10);
        gestureEngine.showMomentaryFeedback('⏩ +10s Jump', 'forward');
        break;
      case 'h':
        e.preventDefault();
        player.seekBy(-10);
        gestureEngine.showMomentaryFeedback('⏪ -10s Jump', 'rewind');
        break;
      case 'arrowleft':
        e.preventDefault();
        player.seekBy(-5);
        gestureEngine.showMomentaryFeedback('⏪ -5s', 'rewind');
        break;
      case 'arrowright':
        e.preventDefault();
        player.seekBy(5);
        gestureEngine.showMomentaryFeedback('⏩ +5s', 'forward');
        break;
      case 'arrowup':
        e.preventDefault();
        if (e.shiftKey) {
          player.setSpeed(Math.min(8.0, player.getPlaybackRate() + 0.25));
        } else {
          player.setVolume(player.state.volume + 5);
        }
        break;
      case 'arrowdown':
        e.preventDefault();
        if (e.shiftKey) {
          player.setSpeed(Math.max(0.25, player.getPlaybackRate() - 0.25));
        } else {
          player.setVolume(player.state.volume - 5);
        }
        break;
      case '[':
        e.preventDefault();
        player.setSpeed(Math.max(0.25, player.getPlaybackRate() - 0.25));
        gestureEngine.showMomentaryFeedback(`Speed: ${player.getPlaybackRate()}x`, 'info');
        break;
      case ']':
        e.preventDefault();
        player.setSpeed(Math.min(8.0, player.getPlaybackRate() + 0.25));
        gestureEngine.showMomentaryFeedback(`Speed: ${player.getPlaybackRate()}x`, 'info');
        break;
      case ',':
        e.preventDefault();
        player.stepFrame(-1);
        break;
      case '.':
        e.preventDefault();
        player.stepFrame(1);
        break;
      case 'r':
        e.preventDefault();
        player.toggleReversePlayback(2.0);
        break;
      case 'm':
        e.preventDefault();
        player.toggleMute();
        break;
      case 'f':
        e.preventDefault();
        fullscreenBtn.click();
        break;
      case '?':
      case '/':
        e.preventDefault();
        helpModal.classList.toggle('active');
        break;
    }
  });
});
