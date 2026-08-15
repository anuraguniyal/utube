/**
 * GestureEngine - Split-Screen Left/Right Gesture Controller
 * 
 * Architecture:
 * - LEFT HALF (X < 50%): REWIND ZONE ⏪
 *   - Press & Hold: Reverse Rewind at -2.0x speed.
 *   - Drag UP: Accelerate Rewind (-2.0x -> -4.0x -> -8.0x).
 *   - Drag DOWN: Decelerate Rewind (-2.0x -> -1.0x -> -0.5x -> -0.25x).
 *   - Release: Resumes normal 1.0x forward playback from rewound position.
 * 
 * - RIGHT HALF (X >= 50%): FORWARD SPEED ZONE ⏩
 *   - Press & Hold: Forward Speed Boost at +2.0x speed.
 *   - Drag UP: Accelerate Forward (+2.0x -> +4.0x -> +8.0x).
 *   - Drag DOWN: Decelerate Forward (+2.0x -> +1.0x -> +0.5x -> +0.25x).
 *   - Release: Restores normal 1.0x forward playback.
 * 
 * - TAP SHORTCUTS:
 *   - Quick Tap Left Half: -10s Jump.
 *   - Quick Tap Right Half: +10s Jump.
 *   - Quick Tap Center: Play / Pause Toggle.
 */

class GestureEngine {
  constructor(overlayElement, playerController, options = {}) {
    this.overlay = overlayElement;
    this.player = playerController;
    
    this.options = Object.assign({
      longPressDelay: 170,        // ms before hold-speed kicks in
      baseSpeed: 2.0,
      speedUpSensitivity: 0.020,  // speed increase per px dragged up
      speedDownSensitivity: 0.014,// speed decrease per px dragged down
      minSpeed: 0.25,
      maxSpeed: 8.0,
      dragThreshold: 6,
      enableHaptics: true
    }, options);

    // Pointer state
    this.activePointerId = null;
    this.pointerStartTime = 0;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    
    this.isInteracting = false;
    this.isHolding = false;
    this.isDragging = false;
    this.holdTimer = null;
    
    this.activeZone = null; // 'left' (rewind) or 'right' (forward)
    this.currentSpeed = 2.0;
    this.lastDispatchedSpeed = null;
    this.lastVibratedMilestone = 2.0;

    this.lastTapTime = 0;
    this.lastTapX = 0;
    this.lastTapY = 0;

    // HUD Elements Cache
    this.hudContainer = document.getElementById('gestureHud');
    this.hudRing = document.getElementById('gestureRing');
    this.hudSpeedValue = document.getElementById('hudSpeedValue');
    this.hudSpeedMode = document.getElementById('hudSpeedMode');
    this.hudSpeedBar = document.getElementById('hudSpeedBar');
    this.hudCenterIcon = document.getElementById('hudCenterIcon');
    this.hudTip = document.getElementById('hudTip');
    this.hudZoneLeft = document.getElementById('hudZoneLeft');
    this.hudZoneRight = document.getElementById('hudZoneRight');

    this.initEvents();
  }

  initEvents() {
    this.overlay.addEventListener('pointerdown', this.onPointerDown.bind(this), { passive: false });
    this.overlay.addEventListener('pointermove', this.onPointerMove.bind(this), { passive: false });
    this.overlay.addEventListener('pointerup', this.onPointerUp.bind(this), { passive: false });
    this.overlay.addEventListener('pointercancel', this.onPointerCancel.bind(this), { passive: false });

    this.overlay.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    this.overlay.style.touchAction = 'none';
  }

  vibrate(pattern = 25) {
    if (this.options.enableHaptics && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  onPointerDown(e) {
    if (this.activePointerId !== null) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    e.preventDefault();
    this.activePointerId = e.pointerId;
    try {
      this.overlay.setPointerCapture(e.pointerId);
    } catch (err) {}

    const rect = this.overlay.getBoundingClientRect();
    this.startX = e.clientX - rect.left;
    this.startY = e.clientY - rect.top;
    this.currentX = this.startX;
    this.currentY = this.startY;
    this.pointerStartTime = performance.now();

    this.isInteracting = true;
    this.isHolding = false;
    this.isDragging = false;
    this.lastDispatchedSpeed = null;

    // Determine Zone: Left (<50%) = Rewind, Right (>=50%) = Forward
    this.activeZone = (this.startX < rect.width * 0.5) ? 'left' : 'right';
    this.currentSpeed = this.options.baseSpeed;
    this.lastVibratedMilestone = this.options.baseSpeed;

    this.showTouchRing(this.startX, this.startY);

    clearTimeout(this.holdTimer);
    this.holdTimer = setTimeout(() => {
      this.triggerHoldAction();
    }, this.options.longPressDelay);
  }

  triggerHoldAction() {
    if (this.activePointerId === null) return;

    this.isHolding = true;
    this.vibrate([30, 20, 30]);

    this.applySpeedFromVerticalDelta(0);
    this.showHUD();
  }

  onPointerMove(e) {
    if (this.activePointerId !== e.pointerId) return;
    e.preventDefault();

    const rect = this.overlay.getBoundingClientRect();
    this.currentX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    this.currentY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const moveDist = Math.hypot(this.currentX - this.startX, this.currentY - this.startY);
    if (!this.isDragging && moveDist > this.options.dragThreshold) {
      this.isDragging = true;
      if (!this.isHolding) {
        clearTimeout(this.holdTimer);
        this.triggerHoldAction();
      }
    }

    if (!this.isHolding) return;

    // Calculate vertical movement delta: deltaY < 0 is UP (faster), deltaY > 0 is DOWN (slower)
    const deltaY = this.currentY - this.startY;
    this.applySpeedFromVerticalDelta(deltaY);
  }

  applySpeedFromVerticalDelta(deltaY) {
    let speed = this.options.baseSpeed;

    if (deltaY < 0) {
      // Dragging UP: Faster
      const upDist = -deltaY;
      speed = this.options.baseSpeed + (upDist * this.options.speedUpSensitivity);
    } else {
      // Dragging DOWN: Slower
      const downDist = deltaY;
      speed = this.options.baseSpeed - (downDist * this.options.speedDownSensitivity);
    }

    speed = Math.max(this.options.minSpeed, Math.min(this.options.maxSpeed, speed));
    speed = Math.round(speed * 10) / 10; // 0.1x quantization
    this.currentSpeed = speed;

    // Signed speed: negative if in Left Rewind zone, positive if in Right Forward zone
    const signedSpeed = (this.activeZone === 'left') ? -speed : speed;

    if (this.lastDispatchedSpeed !== signedSpeed) {
      this.lastDispatchedSpeed = signedSpeed;
      this.player.setContinuousSpeed(signedSpeed);

      // Milestone haptic pulses at 1x, 2x, 4x, 8x
      const milestone = [1.0, 2.0, 4.0, 8.0].find(m => Math.abs(speed - m) < 0.15);
      if (milestone && Math.abs(this.lastVibratedMilestone - milestone) > 0.4) {
        this.lastVibratedMilestone = milestone;
        this.vibrate(20);
      }
    }

    this.updateHUD(deltaY);
  }

  onPointerUp(e) {
    if (this.activePointerId !== e.pointerId) return;
    this.finishInteraction(e);
  }

  onPointerCancel(e) {
    if (this.activePointerId !== e.pointerId) return;
    this.finishInteraction(e, true);
  }

  finishInteraction(e, isCancelled = false) {
    clearTimeout(this.holdTimer);
    this.hideTouchRing();

    const pointerDuration = performance.now() - this.pointerStartTime;
    const rect = this.overlay.getBoundingClientRect();
    const endX = e ? e.clientX - rect.left : this.currentX;
    const endY = e ? e.clientY - rect.top : this.currentY;
    const moveDist = Math.hypot(endX - this.startX, endY - this.startY);

    try {
      if (this.activePointerId !== null) {
        this.overlay.releasePointerCapture(this.activePointerId);
      }
    } catch (err) {}
    this.activePointerId = null;
    this.isInteracting = false;

    if (isCancelled) {
      this.player.restoreNormalPlayback();
      this.hideHUD();
      return;
    }

    // 1. Quick Tap Detection (< 190ms and minimal movement)
    if (!this.isDragging && !this.isHolding && pointerDuration < this.options.longPressDelay && moveDist < this.options.dragThreshold) {
      this.handleTap(endX, endY, rect.width);
      this.hideHUD();
      return;
    }

    // 2. Finished Hold Gesture (Left Rewind or Right Forward):
    // Smoothly restore normal 1.0x forward playback from current/rewound timestamp
    if (this.isHolding) {
      this.player.restoreNormalPlayback();
      const actionName = (this.activeZone === 'left') ? '⏪ Rewound' : '⏩ Fast-Forward';
      this.showMomentaryFeedback(`${actionName} (${this.currentSpeed.toFixed(1)}x) → Resumed 1.0x`, 'info');
      this.hideHUD();
      return;
    }

    this.player.restoreNormalPlayback();
    this.hideHUD();
  }

  handleTap(x, y, width) {
    const now = performance.now();
    const timeSinceLastTap = now - this.lastTapTime;
    const distSinceLastTap = Math.abs(x - this.lastTapX);

    // Double Tap detection (< 280ms)
    if (timeSinceLastTap < 280 && distSinceLastTap < 60) {
      this.lastTapTime = 0;
      this.handleDoubleTap(x, width);
      return;
    }

    this.lastTapTime = now;
    this.lastTapX = x;
    this.lastTapY = y;

    // Single Tap: Left 40% = -10s Jump, Right 40% = +10s Jump, Center 20% = Play/Pause
    setTimeout(() => {
      if (this.lastTapTime === now) {
        const leftBoundary = width * 0.35;
        const rightBoundary = width * 0.65;

        if (x < leftBoundary) {
          this.player.seekBy(-10);
          this.showMomentaryFeedback('⏪ -10s Jump', 'rewind');
          this.vibrate(25);
        } else if (x > rightBoundary) {
          this.player.seekBy(10);
          this.showMomentaryFeedback('⏩ +10s Jump', 'forward');
          this.vibrate(25);
        } else {
          this.player.togglePlay();
          const isPlaying = this.player.isPlaying();
          this.showMomentaryFeedback(isPlaying ? '▶ Playing' : '⏸ Paused', isPlaying ? 'play' : 'pause');
          this.vibrate(20);
        }
      }
    }, 200);
  }

  handleDoubleTap(x, width) {
    if (x < width * 0.5) {
      this.player.seekBy(-10);
      this.showMomentaryFeedback('⏪ -10s Jump', 'rewind');
      this.vibrate([20, 30, 40]);
    } else {
      this.player.seekBy(10);
      this.showMomentaryFeedback('⏩ +10s Jump', 'forward');
      this.vibrate([20, 30, 40]);
    }
  }

  // --- Visual HUD Rendering ---

  showTouchRing(x, y) {
    if (!this.hudRing) return;
    this.hudRing.style.left = `${x}px`;
    this.hudRing.style.top = `${y}px`;
    this.hudRing.classList.add('charging');
    this.hudRing.classList.remove('hidden', 'active');
  }

  hideTouchRing() {
    if (!this.hudRing) return;
    this.hudRing.classList.remove('charging', 'active');
    this.hudRing.classList.add('hidden');
  }

  showHUD() {
    if (!this.hudContainer) return;
    this.hudContainer.classList.add('active');
    if (this.hudRing) {
      this.hudRing.classList.remove('charging');
      this.hudRing.classList.add('active');
    }
  }

  hideHUD() {
    if (!this.hudContainer) return;
    this.hudContainer.classList.remove('active');
  }

  updateHUD(deltaY = 0) {
    if (!this.hudContainer) return;

    const isLeftRewind = (this.activeZone === 'left');
    const sign = isLeftRewind ? '-' : '+';

    // Highlight active half
    if (this.hudZoneLeft) this.hudZoneLeft.classList.toggle('active', isLeftRewind);
    if (this.hudZoneRight) this.hudZoneRight.classList.toggle('active', !isLeftRewind);

    // Update Speed Multiplier Text
    if (this.hudSpeedValue) {
      this.hudSpeedValue.textContent = `${sign}${this.currentSpeed.toFixed(1)}x`;
      
      if (isLeftRewind) {
        this.hudSpeedValue.className = 'hud-speed-value reverse-speed';
      } else if (this.currentSpeed > 2.0) {
        this.hudSpeedValue.className = 'hud-speed-value super-fast';
      } else {
        this.hudSpeedValue.className = 'hud-speed-value normal-fast';
      }
    }

    // Update Mode Label & Center Icon
    if (this.hudSpeedMode && this.hudCenterIcon) {
      if (isLeftRewind) {
        this.hudCenterIcon.textContent = '⏪';
        this.hudSpeedMode.textContent = `REVERSE REWIND (${this.currentSpeed.toFixed(1)}x Speed)`;
        this.hudSpeedMode.style.color = '#fb7185';
      } else {
        this.hudCenterIcon.textContent = '⏩';
        this.hudSpeedMode.textContent = `FORWARD FAST PLAY (${this.currentSpeed.toFixed(1)}x Speed)`;
        this.hudSpeedMode.style.color = '#34d399';
      }
    }

    // Update Speed Gauge Bar
    if (this.hudSpeedBar) {
      const norm = Math.min(100, Math.max(0, ((this.currentSpeed - 0.25) / (8.0 - 0.25)) * 100));
      this.hudSpeedBar.style.height = `${norm}%`;
      if (isLeftRewind) {
        this.hudSpeedBar.style.background = 'linear-gradient(0deg, #f43f5e 0%, #fb7185 100%)';
      } else {
        this.hudSpeedBar.style.background = 'linear-gradient(0deg, #3b82f6 0%, #10b981 60%, #f59e0b 100%)';
      }
    }

    // Update Tip Text
    if (this.hudTip) {
      const modeName = isLeftRewind ? 'Rewind' : 'Forward';
      if (deltaY < -15) {
        this.hudTip.textContent = `↑ Dragging UP: Faster ${modeName} (${this.currentSpeed.toFixed(1)}x)`;
      } else if (deltaY > 15) {
        this.hudTip.textContent = `↓ Dragging DOWN: Slower ${modeName} (${this.currentSpeed.toFixed(1)}x)`;
      } else {
        this.hudTip.textContent = isLeftRewind
          ? `⏪ Left Zone: Rewinding at -${this.currentSpeed.toFixed(1)}x • Drag ↑ UP Faster / ↓ DOWN Slower`
          : `⏩ Right Zone: Forward at +${this.currentSpeed.toFixed(1)}x • Drag ↑ UP Faster / ↓ DOWN Slower`;
      }
    }
  }

  showMomentaryFeedback(text, type = 'info') {
    const toast = document.getElementById('momentaryToast');
    if (!toast) return;
    toast.textContent = text;
    toast.className = `momentary-toast show type-${type}`;
    
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.className = 'momentary-toast';
    }, 1300);
  }
}

if (typeof window !== 'undefined') {
  window.GestureEngine = GestureEngine;
}
