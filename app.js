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
  const screenshotFrameBtn = document.getElementById('screenshotFrameBtn');

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
  const addBookmarkCardBtn = document.getElementById('addBookmarkCardBtn');
  const copyCurrentTimeBtn = document.getElementById('copyCurrentTimeBtn');
  const copyCurrentTimeIcon = document.getElementById('copyCurrentTimeIcon');
  const filterBmAll = document.getElementById('filterBmAll');
  const filterBmCurrent = document.getElementById('filterBmCurrent');
  const bmCountAll = document.getElementById('bmCountAll');
  const bmCountCurrent = document.getElementById('bmCountCurrent');
  const bmCountHeaderBadge = document.getElementById('bmCountHeaderBadge');

  let activeBookmarkFilter = 'all'; // 'all' | 'current'

  // Dedicated Search Sidebar (Right of Video Player) Elements
  const playerSearchSidebar = document.getElementById('playerSearchSidebar');
  const closeSearchSidebarBtn = document.getElementById('closeSearchSidebarBtn');
  const sidebarSearchInput = document.getElementById('sidebarSearchInput');
  const sidebarSearchBtn = document.getElementById('sidebarSearchBtn');
  const searchSidebarList = document.getElementById('searchSidebarList');
  const searchSidebarQuery = document.getElementById('searchSidebarQuery');
  const searchSidebarCount = document.getElementById('searchSidebarCount');

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

  // 3. Render YouTube Recommendations Feed (100% Dynamic)
  let activeCategory = 'Trending';
  let dynamicRecommendations = [];

  function renderRecommendations() {
    if (!recommendationsGrid) return;

    if (!dynamicRecommendations || dynamicRecommendations.length === 0) {
      recommendationsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.85rem;">
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">✨</div>
          Fetching live YouTube discoveries...
        </div>
      `;
      return;
    }

    recommendationsGrid.innerHTML = dynamicRecommendations.map(video => `
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

  async function loadDynamicDiscoveries(category = 'Trending') {
    if (typeof window.searchYouTubeVideos !== 'function') return;
    try {
      const q = category === 'All' ? 'trending 4k' : category;
      const res = await window.searchYouTubeVideos(q);
      if (Array.isArray(res) && res.length > 0) {
        dynamicRecommendations = res;
        renderRecommendations();
      }
    } catch (e) {}
  }

  // Category Filter Chips
  if (categoryChipsBar) {
    categoryChipsBar.querySelectorAll('.topic-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        categoryChipsBar.querySelectorAll('.topic-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCategory = chip.getAttribute('data-category');
        loadDynamicDiscoveries(activeCategory);
      });
    });
  }

  // Load initial dynamic discoveries
  loadDynamicDiscoveries('Trending');

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

    // 1. Check YouTube Player API video data
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

    // 2. Fetch from official YouTube oEmbed endpoint
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

    if (titleEl) titleEl.textContent = 'Loading video title...';

    // Fetch official real YouTube title
    const meta = await fetchVideoMetadata(vidId);
    if (meta && vidId === player.videoId) {
      if (titleEl) titleEl.textContent = meta.title;
      if (descEl) descEl.textContent = meta.description;
      renderBookmarks();
    }
  }

  function loadNewVideo(query, startTime = 0) {
    const res = player.loadVideo(query, startTime);
    if (res.success) {
      updateActiveCard(res.videoId);
      if (urlInput) urlInput.value = `https://youtu.be/${res.videoId}`;
      
      updateVideoMetadata(res.videoId);
      renderBookmarks();

      if (startTime > 0) {
        setTimeout(() => {
          player.seekTo(startTime, true);
          player.play();
        }, 300);
      }

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
    videoViewport.style.width = widthStr;
    videoViewport.style.maxWidth = widthStr;
    playerTheaterWrapper.style.width = '100%';
    playerTheaterWrapper.style.maxWidth = '100%';
    playerTheaterWrapper.setAttribute('data-video-width', widthStr);

    [sizeCompactBtn, sizeStandardBtn, sizeCinemaBtn].forEach(b => {
      if (b) b.classList.remove('active');
    });
    if (activeBtn) activeBtn.classList.add('active');

    updateResizeBadge();
  }

  sizeCompactBtn.addEventListener('click', () => {
    setPlayerWidth('720px', sizeCompactBtn);
    gestureEngine.showMomentaryFeedback('Compact Video Mode (720px)', 'info');
  });

  sizeStandardBtn.addEventListener('click', () => {
    setPlayerWidth('1080px', sizeStandardBtn);
    gestureEngine.showMomentaryFeedback('Standard Video Mode (1080px)', 'info');
  });

  sizeCinemaBtn.addEventListener('click', () => {
    setPlayerWidth('100%', sizeCinemaBtn);
    gestureEngine.showMomentaryFeedback('Cinema Full Width Video', 'info');
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
    const rect = videoViewport.getBoundingClientRect();
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
      startWidth = videoViewport.getBoundingClientRect().width;

      e.preventDefault();
      e.stopPropagation();
    });

    window.addEventListener('pointermove', (e) => {
      if (!isResizing) return;
      const deltaX = (e.clientX - startResizeX) * 2; // symmetric expand
      const newWidth = Math.max(480, Math.min(window.innerWidth - 60, startWidth + deltaX));
      
      videoViewport.style.width = `${newWidth}px`;
      videoViewport.style.maxWidth = `${newWidth}px`;
      playerTheaterWrapper.setAttribute('data-video-width', `${newWidth}px`);

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

  // 6. Search & URL Loader Listeners
  function handleUniversalSearchOrLoad(val) {
    const query = (val || '').trim();
    if (!query) return;

    const parsedId = player.parseYouTubeId(query);
    if (parsedId) {
      loadNewVideo(query);
      gestureEngine.showMomentaryFeedback(`▶ Loading Video: ${parsedId}`, 'info');
    } else {
      executeSearch(query);
    }
  }

  loadVideoBtn.addEventListener('click', () => {
    handleUniversalSearchOrLoad(urlInput.value);
  });

  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleUniversalSearchOrLoad(urlInput.value);
    }
  });



  if (pasteBtn && navigator.clipboard) {
    pasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        urlInput.value = text;
        handleUniversalSearchOrLoad(text);
      } catch (err) {
        gestureEngine.showMomentaryFeedback('Please paste search or URL in the input box', 'info');
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

  // Screenshot Current Frame Action
  async function captureCurrentFrameScreenshot() {
    const vidId = player.videoId;
    if (!vidId) return;

    const currentTime = player.getCurrentTime() || player.state.currentTime || 0;
    const formattedTime = player.formatTime(currentTime);
    const videoTitle = resolveVideoTitleSync(vidId, player.state.title || 'YouTube Video');

    gestureEngine.showMomentaryFeedback(`📸 Capturing frame @ ${formattedTime}...`, 'info');

    try {
      // 1. Create a high-res 16:9 canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');

      // Fill rich dark backdrop
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Fetch highest quality available frame thumbnail
      const imgUrls = [
        `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`,
        `https://img.youtube.com/vi/${vidId}/sddefault.jpg`,
        `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`,
        `https://img.youtube.com/vi/${vidId}/0.jpg`
      ];

      let loadedImg = null;
      for (const url of imgUrls) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Image failed'));
            img.src = url;
            setTimeout(() => reject(new Error('Image timeout')), 3000);
          });
          if (img.naturalWidth > 120) {
            loadedImg = img;
            break;
          }
        } catch (e) {}
      }

      if (loadedImg) {
        ctx.drawImage(loadedImg, 0, 0, canvas.width, canvas.height);
      } else {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 3. Render watermark gradient and details badge on bottom
      const bottomGrad = ctx.createLinearGradient(0, canvas.height - 180, 0, canvas.height);
      bottomGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      bottomGrad.addColorStop(1, 'rgba(0, 0, 0, 0.88)');
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, canvas.height - 180, canvas.width, 180);

      // Title & Timestamp
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
      ctx.fillText(videoTitle, 48, canvas.height - 72);

      ctx.font = '700 24px monospace';
      ctx.fillStyle = '#facc15';
      ctx.fillText(`⏱ Timestamp: ${formattedTime} • UTUBE Frame Snapshot`, 48, canvas.height - 30);

      // 4. Download PNG Blob
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Blob generation failed');
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const sanitizedTitle = videoTitle.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
        a.download = `UTUBE_${sanitizedTitle}_${formattedTime.replace(':', 'm')}s.png`;
        a.href = downloadUrl;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          a.remove();
          URL.revokeObjectURL(downloadUrl);
        }, 1000);

        gestureEngine.showMomentaryFeedback(`📸 Frame snapshot saved! (${formattedTime})`, 'info');
      }, 'image/png');

    } catch (err) {
      console.warn('Canvas export failed, falling back to direct thumbnail:', err);
      const a = document.createElement('a');
      a.href = `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`;
      a.download = `UTUBE_${vidId}_${formattedTime.replace(':', 'm')}s.jpg`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 1000);
      gestureEngine.showMomentaryFeedback(`📸 Snapshot image downloaded! (${formattedTime})`, 'info');
    }
  }

  if (screenshotFrameBtn) {
    screenshotFrameBtn.addEventListener('click', captureCurrentFrameScreenshot);
  }

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

  // 12. Dedicated Search Sidebar (Right of Video Player) Controller
  function openSearchSidebar() {
    if (playerSearchSidebar) {
      playerSearchSidebar.style.setProperty('display', 'flex', 'important');
      playerSearchSidebar.classList.add('open');
    }
  }

  function closeSearchSidebar() {
    if (playerSearchSidebar) {
      playerSearchSidebar.style.setProperty('display', 'none', 'important');
      playerSearchSidebar.classList.remove('open');
    }
  }

  window.openSearchSidebar = openSearchSidebar;
  window.closeSearchSidebar = closeSearchSidebar;
  window.executeSearch = executeSearch;

  if (closeSearchSidebarBtn) {
    closeSearchSidebarBtn.addEventListener('click', closeSearchSidebar);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && playerSearchSidebar && playerSearchSidebar.style.display !== 'none') {
      closeSearchSidebar();
    }
  });

  async function executeSearch(query) {
    const q = (query || '').trim();
    if (!q) return;

    openSearchSidebar();
    if (searchSidebarQuery) searchSidebarQuery.textContent = `"${q}"`;
    if (searchSidebarCount) searchSidebarCount.textContent = '...';
    if (sidebarSearchInput) sidebarSearchInput.value = q;

    if (searchSidebarList) {
      searchSidebarList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.825rem;">
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔍</div>
          Searching for "<strong>${q}</strong>"...
        </div>
      `;
    }

    try {
      const results = typeof window.searchYouTubeVideos === 'function' 
        ? await window.searchYouTubeVideos(q)
        : (window.YOUTUBE_RECOMMENDATIONS || []).slice(0, 10);

      renderSearchResults(results, q);
    } catch (err) {
      console.warn('Search error:', err);
      const fallback = (window.YOUTUBE_RECOMMENDATIONS || []).slice(0, 10);
      renderSearchResults(fallback, q);
    }
  }

  function renderSearchResults(results, query = '') {
    if (!searchSidebarList) return;
    const list = Array.isArray(results) ? results : [];
    if (searchSidebarCount) searchSidebarCount.textContent = list.length;
    if (searchSidebarQuery) searchSidebarQuery.textContent = query ? `"${query}"` : 'Top Recommendations';

    if (list.length === 0) {
      searchSidebarList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-dim); font-size: 0.8rem;">
          No videos found for "<strong>${query}</strong>". Try different keywords or paste a direct YouTube link.
        </div>
      `;
      return;
    }

    const bookmarks = player.state.bookmarks || [];
    const isBookmarked = (vidId) => bookmarks.some(b => b && b.videoId === vidId);

    searchSidebarList.innerHTML = list.map(item => {
      const isCurrent = player.videoId === item.id;
      const activeClass = isCurrent ? 'active-playing' : '';
      const saved = isBookmarked(item.id);

      return `
        <div class="search-result-card ${activeClass}" data-video-id="${item.id}" title="Click to play: ${item.title}" style="display: flex; flex-direction: row; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 6px 8px; transition: all 150ms ease; cursor: pointer; width: 100%; box-sizing: border-box;">
          <div class="search-card-thumb-wrap" style="position: relative; width: 88px; min-width: 88px; max-width: 88px; height: 50px; border-radius: 6px; overflow: hidden; background: #000; flex-shrink: 0;">
            <img class="search-card-thumb" src="${item.thumbnail || `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`}" alt="${item.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.src='https://img.youtube.com/vi/${item.id}/hqdefault.jpg'" />
            <span class="search-card-duration" style="position: absolute; bottom: 2px; right: 2px; background: rgba(0,0,0,0.85); color: #fff; font-family: monospace; font-size: 0.6rem; font-weight: 700; padding: 1px 3px; border-radius: 3px; line-height: 1;">${item.duration || '▶'}</span>
          </div>
          <div class="search-card-content" style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; overflow: hidden;">
            <div class="search-card-title" style="font-size: 0.775rem; font-weight: 700; color: #f1f5f9; line-height: 1.3; white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${item.title}</div>
            <div class="search-card-meta" style="font-size: 0.7rem; color: #94a3b8; display: flex; align-items: center; gap: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              <span class="search-card-channel" style="color: #93c5fd; font-weight: 600;">${item.channel || 'YouTube'}</span>
              <span>•</span>
              <span>${item.views || 'Popular'}</span>
            </div>
          </div>
          <div class="search-card-actions" style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; margin-left: auto;">
            <button class="search-play-btn" data-video-id="${item.id}" title="Play in left player" style="display: inline-flex; align-items: center; justify-content: center; height: 22px; padding: 0 8px; font-size: 0.68rem; font-weight: 700; border-radius: 9999px; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.35); color: #93c5fd; cursor: pointer; white-space: nowrap;">
              ▶ Play
            </button>
            <button class="search-bookmark-btn ${saved ? 'saved' : ''}" data-video-id="${item.id}" data-title="${encodeURIComponent(item.title)}" title="${saved ? 'Already Saved in Markers' : 'Save to Bookmarks'}" style="display: inline-flex; align-items: center; justify-content: center; height: 22px; padding: 0 7px; font-size: 0.68rem; font-weight: 700; border-radius: 9999px; background: ${saved ? 'rgba(16,185,129,0.18)' : 'rgba(250,204,21,0.12)'}; border: 1px solid ${saved ? 'rgba(16,185,129,0.4)' : 'rgba(250,204,21,0.3)'}; color: ${saved ? '#34d399' : '#fde047'}; cursor: pointer; white-space: nowrap;">
              ${saved ? '✓ Saved' : '⭐ Bookmark'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Wire Card Clicks & Play Button Clicks to play video on left
    searchSidebarList.querySelectorAll('.search-result-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.search-bookmark-btn')) return;
        const vidId = card.getAttribute('data-video-id');
        if (vidId) {
          loadNewVideo(vidId);
          searchSidebarList.querySelectorAll('.search-result-card').forEach(c => c.classList.remove('active-playing'));
          card.classList.add('active-playing');
          gestureEngine.showMomentaryFeedback(`▶ Loaded video on left`, 'info');
        }
      });
    });

    // Wire Bookmark Button Clicks on each search result
    searchSidebarList.querySelectorAll('.search-bookmark-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const vidId = btn.getAttribute('data-video-id');
        const title = decodeURIComponent(btn.getAttribute('data-title') || '');
        if (!vidId) return;

        const already = player.state.bookmarks && player.state.bookmarks.some(b => b.videoId === vidId);
        if (!already) {
          player.addBookmark(`Saved Search Result`, title, vidId, 0);
          btn.classList.add('saved');
          btn.textContent = '✓ Saved';
          btn.style.background = 'rgba(16,185,129,0.18)';
          btn.style.borderColor = 'rgba(16,185,129,0.4)';
          btn.style.color = '#34d399';
          renderBookmarks();
          gestureEngine.showMomentaryFeedback(`⭐ Saved "${title.slice(0, 24)}..." to Bookmarks!`, 'info');
        } else {
          gestureEngine.showMomentaryFeedback(`📌 Already saved in your Bookmarks!`, 'info');
        }
      });
    });
  }

  if (sidebarSearchBtn && sidebarSearchInput) {
    sidebarSearchBtn.addEventListener('click', () => {
      handleUniversalSearchOrLoad(sidebarSearchInput.value);
    });
    sidebarSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleUniversalSearchOrLoad(sidebarSearchInput.value);
      }
    });
  }

  // 13. Bookmarks & Markers
  if (filterBmAll && filterBmCurrent) {
    filterBmAll.addEventListener('click', () => {
      activeBookmarkFilter = 'all';
      filterBmAll.classList.add('active');
      filterBmCurrent.classList.remove('active');
      renderBookmarks();
    });

    filterBmCurrent.addEventListener('click', () => {
      activeBookmarkFilter = 'current';
      filterBmCurrent.classList.add('active');
      filterBmAll.classList.remove('active');
      renderBookmarks();
    });
  }

  function resolveVideoTitleSync(videoId, fallbackTitle = '') {
    if (fallbackTitle && !fallbackTitle.startsWith('Video:') && !fallbackTitle.startsWith('YouTube Video (')) {
      return fallbackTitle;
    }
    if (videoMetadataCache.has(videoId)) {
      return videoMetadataCache.get(videoId).title;
    }

    if (player.videoId === videoId) {
      const curEl = document.getElementById('currentVideoTitle');
      if (curEl && curEl.textContent && !curEl.textContent.startsWith('Loading')) {
        return curEl.textContent;
      }
      if (player.state.title) return player.state.title;
    }

    // Trigger async fetch in background to backfill title
    fetchVideoMetadata(videoId).then(meta => {
      if (meta && meta.title && meta.title !== fallbackTitle) {
        // Update stored bookmarks
        player.state.bookmarks.forEach(b => {
          if (b.videoId === videoId) b.videoTitle = meta.title;
        });
        player.saveBookmarksToStorage();
        renderBookmarks();
      }
    });

    return fallbackTitle || `Video (${videoId})`;
  }

  function handleAddBookmark() {
    try {
      const currentTitle = resolveVideoTitleSync(player.videoId);
      const bm = player.addBookmark('', currentTitle);
      renderBookmarks();
      gestureEngine.showMomentaryFeedback(`⭐ Marked @ ${player.formatTime(bm.time)}`, 'info');
    } catch (e) {
      console.warn('Bookmark add error:', e);
    }
  }

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
    const allBookmarks = player.state.bookmarks || [];
    const currentVideoBookmarks = allBookmarks.filter(b => b && b.videoId === player.videoId);

    // Update Counts
    if (bmCountAll) bmCountAll.textContent = allBookmarks.length;
    if (bmCountCurrent) bmCountCurrent.textContent = currentVideoBookmarks.length;
    if (bmCountHeaderBadge) bmCountHeaderBadge.textContent = allBookmarks.length;

    // Refresh Bookmark states on visible search result cards
    if (searchSidebarList) {
      searchSidebarList.querySelectorAll('.search-bookmark-btn').forEach(btn => {
        const vidId = btn.getAttribute('data-video-id');
        const isSaved = allBookmarks.some(b => b && b.videoId === vidId);
        btn.classList.toggle('saved', isSaved);
        btn.textContent = isSaved ? '✓ Saved' : '⭐ Bookmark';
        if (isSaved) {
          btn.style.background = 'rgba(16,185,129,0.18)';
          btn.style.borderColor = 'rgba(16,185,129,0.4)';
          btn.style.color = '#34d399';
        } else {
          btn.style.background = 'rgba(250,204,21,0.12)';
          btn.style.borderColor = 'rgba(250,204,21,0.3)';
          btn.style.color = '#fde047';
        }
      });
    }

    const displayList = activeBookmarkFilter === 'current' ? currentVideoBookmarks : allBookmarks;

    if (displayList.length === 0) {
      const emptyMsg = activeBookmarkFilter === 'current'
        ? `No markers saved for this video yet. Click "⭐ Mark Time" to save one!`
        : `No markers saved yet. Click "⭐ Mark Time" to bookmark timestamps from any video!`;
      bookmarksList.innerHTML = `<div style="color: var(--text-dim); font-size: 0.8rem; text-align: center; padding: 1rem;">${emptyMsg}</div>`;
      renderTimelineMarkers();
      return;
    }

    // Group bookmarks by videoId
    const groupsMap = new Map();

    // Ensure current video is first if present
    if (currentVideoBookmarks.length > 0) {
      groupsMap.set(player.videoId, {
        videoId: player.videoId,
        isCurrent: true,
        title: resolveVideoTitleSync(player.videoId),
        items: []
      });
    }

    displayList.forEach(bm => {
      if (!groupsMap.has(bm.videoId)) {
        groupsMap.set(bm.videoId, {
          videoId: bm.videoId,
          isCurrent: bm.videoId === player.videoId,
          title: resolveVideoTitleSync(bm.videoId, bm.videoTitle),
          items: []
        });
      }
      groupsMap.get(bm.videoId).items.push(bm);
    });

    let html = '';
    groupsMap.forEach(group => {
      if (group.items.length === 0) return;

      const isCurrent = group.isCurrent;
      const groupHeader = `
        <div class="bm-group-header" style="display:flex;flex-direction:row;align-items:center;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.08);width:100%;box-sizing:border-box;gap:6px;">
          <div class="bm-group-title" title="${group.title}" style="display:inline-flex;flex-direction:row;align-items:center;gap:6px;font-size:0.775rem;font-weight:700;color:#fff;min-width:0;flex:1;overflow:hidden;">
            <span>${isCurrent ? '▶' : '📺'}</span>
            <span class="bm-group-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${isCurrent ? '#93c5fd' : '#e2e8f0'};flex:1;min-width:0;">
              ${isCurrent ? (group.title ? `${group.title} (Current Video)` : 'Current Video') : group.title}
            </span>
            <span class="bm-count-pill" style="font-family:var(--font-mono);font-size:0.65rem;font-weight:700;background:rgba(255,255,255,0.1);color:var(--text-dim);padding:1px 6px;border-radius:9999px;flex-shrink:0;">${group.items.length}</span>
          </div>
          <div class="bm-group-actions" style="display:inline-flex;align-items:center;gap:5px;flex-shrink:0;">
            ${!isCurrent ? `
              <button class="bm-play-video-btn" data-vid="${group.videoId}" style="display:inline-flex;align-items:center;justify-content:center;height:22px;padding:0 8px;font-size:0.68rem;font-weight:700;border-radius:9999px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#e2e8f0;cursor:pointer;flex-shrink:0;white-space:nowrap;" title="Load video: ${group.title}">
                ▶ Play
              </button>
            ` : ''}
            <button class="bm-delete-group-btn" data-vid="${group.videoId}" data-title="${group.title}" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;min-width:22px;border-radius:4px;font-size:0.75rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#f87171;cursor:pointer;line-height:1;padding:0;" title="Remove all bookmarks for this video">
              ✕
            </button>
          </div>
        </div>
      `;

      const rows = group.items.map(bm => {
        const url = bm.videoUrl || `https://youtu.be/${bm.videoId}?t=${Math.floor(bm.time)}`;
        return `
          <div class="bookmark-row" style="display:flex;flex-direction:row;flex-wrap:nowrap;align-items:center;justify-content:space-between;width:100%;box-sizing:border-box;min-height:34px;padding:3px 6px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.05);border-radius:6px;gap:6px;">
            <div class="bm-row-left" data-time="${bm.time}" data-vid="${bm.videoId}" title="Click to play from ${player.formatTime(bm.time)}" style="display:inline-flex;flex-direction:row;align-items:center;cursor:pointer;flex-shrink:0;">
              <span class="bookmark-time-tag" style="font-family:var(--font-mono);font-size:0.75rem;font-weight:800;background:rgba(250,204,21,0.18);color:#fde047;border:1px solid rgba(250,204,21,0.4);padding:2px 6px;border-radius:4px;letter-spacing:0.03em;display:inline-block;line-height:1.2;">${player.formatTime(bm.time)}</span>
            </div>
            <div class="bm-row-actions" style="display:inline-flex;flex-direction:row;flex-wrap:nowrap;align-items:center;justify-content:flex-end;gap:5px;flex-shrink:0;">
              <button class="bm-row-play-btn" data-time="${bm.time}" data-vid="${bm.videoId}" title="Play from ${player.formatTime(bm.time)}" style="display:inline-flex;flex-direction:row;align-items:center;justify-content:center;height:24px;padding:0 8px;font-size:0.7rem;font-weight:700;border-radius:9999px;color:#93c5fd;border:1px solid rgba(59,130,246,0.35);background:rgba(59,130,246,0.12);cursor:pointer;white-space:nowrap;line-height:1;">
                ▶ Play
              </button>
              <button class="copy-marker-btn" data-url="${url}" title="Copy Link: ${url}" style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;min-width:24px;border-radius:4px;font-size:0.75rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#38bdf8;cursor:pointer;line-height:1;padding:0;">
                <span class="marker-copy-icon">🔗</span>
              </button>
              <button class="delete-marker-btn" data-id="${bm.id}" title="Remove Marker" style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;min-width:24px;border-radius:4px;font-size:0.75rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#f87171;cursor:pointer;line-height:1;padding:0;">
                ✕
              </button>
            </div>
          </div>
        `;
      }).join('');

      html += `
        <div class="bm-group-container ${isCurrent ? 'is-current' : ''}" style="display:flex;flex-direction:column;gap:5px;background:rgba(255,255,255,0.02);border:1px solid ${isCurrent ? 'rgba(59,130,246,0.35)' : 'var(--border-subtle)'};border-radius:8px;padding:7px 8px;width:100%;box-sizing:border-box;">
          ${groupHeader}
          <div class="bm-group-items" style="display:flex;flex-direction:column;gap:4px;width:100%;">
            ${rows}
          </div>
        </div>
      `;
    });

    bookmarksList.innerHTML = html;

    // Jump / Play marker handler
    const handleSeekToMarker = (targetVid, time) => {
      const targetTime = Math.max(0, parseFloat(time) || 0);
      if (targetVid === player.videoId) {
        player.seekTo(targetTime, true);
        player.play();
        gestureEngine.showMomentaryFeedback(`⭐ Playing @ ${player.formatTime(targetTime)}`, 'info');
      } else {
        loadNewVideo(targetVid, targetTime);
        gestureEngine.showMomentaryFeedback(`📺 Loaded video @ ${player.formatTime(targetTime)}`, 'info');
      }
    };

    bookmarksList.querySelectorAll('.bm-row-left').forEach(el => {
      el.addEventListener('click', () => {
        const time = parseFloat(el.getAttribute('data-time'));
        const targetVid = el.getAttribute('data-vid');
        handleSeekToMarker(targetVid, time);
      });
    });

    bookmarksList.querySelectorAll('.bm-row-play-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const time = parseFloat(btn.getAttribute('data-time'));
        const targetVid = btn.getAttribute('data-vid');
        handleSeekToMarker(targetVid, time);
      });
    });

    // Play entire video group
    bookmarksList.querySelectorAll('.bm-play-video-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetVid = btn.getAttribute('data-vid');
        loadNewVideo(targetVid);
      });
    });

    // Copy Marker Timestamp URL
    bookmarksList.querySelectorAll('.copy-marker-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const timestampUrl = btn.getAttribute('data-url');

        try {
          await navigator.clipboard.writeText(timestampUrl);
          const icon = btn.querySelector('.marker-copy-icon');
          if (icon) icon.textContent = '✓';
          gestureEngine.showMomentaryFeedback(`📋 Copied URL: ${timestampUrl}`, 'info');
          setTimeout(() => {
            if (icon) icon.textContent = '🔗';
          }, 2000);
        } catch (err) {
          prompt('Copy timestamp URL:', timestampUrl);
        }
      });
    });

    // Delete Individual Marker
    bookmarksList.querySelectorAll('.delete-marker-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        player.removeBookmark(id);
        renderBookmarks();
        gestureEngine.showMomentaryFeedback('Marker removed', 'info');
      });
    });

    // Delete Entire Video Group / Section of Bookmarks
    bookmarksList.querySelectorAll('.bm-delete-group-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const vid = btn.getAttribute('data-vid');
        const title = btn.getAttribute('data-title') || 'video';
        if (typeof player.removeBookmarksForVideo === 'function') {
          player.removeBookmarksForVideo(vid);
        } else {
          player.state.bookmarks = (player.state.bookmarks || []).filter(b => b && b.videoId !== vid);
          player.saveBookmarksToStorage();
          player.notifyState();
        }
        renderBookmarks();
        gestureEngine.showMomentaryFeedback(`Removed all bookmarks for this video`, 'info');
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
  if (openHelpBtn) {
    openHelpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.openHelpModal === 'function') {
        window.openHelpModal();
      }
    });
  }

  if (closeHelpBtn) {
    closeHelpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.closeHelpModal === 'function') {
        window.closeHelpModal();
      }
    });
  }

  if (helpModal) {
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal && typeof window.closeHelpModal === 'function') {
        window.closeHelpModal();
      }
    });
  }

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
      case ',':
      case '<':
        e.preventDefault();
        player.stepFrame(-1);
        gestureEngine.showMomentaryFeedback('◀ Frame Back ( , / J )', 'info');
        break;
      case 'k':
      case '.':
      case '>':
        e.preventDefault();
        player.stepFrame(1);
        gestureEngine.showMomentaryFeedback('Frame Forward ▶ ( . / K )', 'info');
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
      case 's':
        e.preventDefault();
        captureCurrentFrameScreenshot();
        break;
      case '?':
      case '/':
        e.preventDefault();
        const m = document.getElementById('helpModal');
        if (m && m.style.display === 'flex') {
          if (typeof window.closeHelpModal === 'function') window.closeHelpModal();
        } else {
          if (typeof window.openHelpModal === 'function') window.openHelpModal();
        }
        break;
      case 'escape':
        if (typeof window.closeHelpModal === 'function') window.closeHelpModal();
        break;
    }
  });
});
