# UTUBE • Enhanced YouTube Gesture & Playback Suite

An advanced, gesture-driven YouTube web player built with pure **HTML5, Vanilla CSS3, and JavaScript**. Designed to provide precise playback control, high-speed reverse rewinding, frame-by-frame navigation, floating storyboard frame previews, and fluid video resizing without requiring Node.js, build tools, or external dependencies.

---

## ✨ Features

### 1. 🎮 Split-Screen 2D Gesture Engine
Touch or click-and-drag directly on the video viewport for continuous gesture navigation:

```
┌───────────────────────────────────────┬───────────────────────────────────────┐
│           ⏪ LEFT HALF ZONE            │          ⏩ RIGHT HALF ZONE           │
│             (REVERSE REWIND)          │            (FORWARD BOOST)            │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ • Press & Hold:  Rewind at -2.0x      │ • Press & Hold:  Forward at +2.0x     │
│ • Drag ↑ UP:     Accelerate to -8.0x  │ • Drag ↑ UP:     Accelerate to +8.0x  │
│ • Drag ↓ DOWN:   Slow down to -0.25x  │ • Drag ↓ DOWN:   Slow down to +0.25x  │
│ • Release:       Resumes normal 1.0x  │ • Release:       Resumes normal 1.0x  │
│ • Quick Tap:     Jump -10s            │ • Quick Tap:     Jump +10s            │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

- **Smooth Reverse Engine**: Calibrated virtual time stepping ($\Delta t \cdot \text{speed}$) on a $200\text{ms}$ keyframe interval to ensure smooth backward rendering without iframe buffer freezing.
- **Native Forward Acceleration**: Employs native YouTube HTML5 playback rates for stutter-free forward speed adjustment.
- **Center Tap**: Toggles Play / Pause.

---

### 2. 🖼️ YouTube-Style Timeline Frame Viewer
- **Hover & Drag Preview**: Hovering or scrubbing across the timeline displays a floating $16:9$ thumbnail preview card above the cursor.
- **Dynamic Storyboard Keyframes**: Automatically switches thumbnail frames (`0.jpg`, `1.jpg`, `2.jpg`, `3.jpg`) based on the cursor position across the video duration.
- **Relative Jump Offset**: Displays the target timestamp alongside relative time offsets (`+0:15s` / `-0:45s`).
- **Edge Clamping**: Automatically prevents the preview card from overflowing player boundaries at $0\%$ or $100\%$ timeline positions.

---

### 3. 📐 Interactive Video Resizing Suite
- **Corner Drag Grip (`↘`)**: Click and drag the bottom-right corner handle to resize the player width and height freely with a real-time dimension badge (`1280 × 720 (16:9)`). Double-click resets to standard $1080\text{px}$.
- **Bottom Toolbar Presets**:
  - **`Compact`**: $720\text{px}$ compact window.
  - **`Standard`**: $1080\text{px}$ default theater view.
  - **`Cinema`**: $100\%$ full viewport width.
  - **`16:9 / 21:9`**: Aspect ratio switcher (Standard $16:9$ vs. Ultrawide Cinematic $21:9$).
  - **`Fit / Fill`**: Toggle between letterbox fit and edge-to-edge zoom crop.
- **Fluid Multi-Row Container Queries (`@container`)**: Controls adapt fluidly to any container size without cutting off buttons or sliders.

---

### 4. 🧭 Clean Header Navigation & Centered URL Loader
- **Top-Left**: Brand logo (`UTUBE Pro`) + **`💡 Guide`** shortcut modal.
- **Centered Search/URL Bar**: Paste any YouTube URL or Video ID (e.g., `https://youtu.be/...`, `https://www.youtube.com/watch?v=...`, or raw video ID) with 1-click clipboard paste.

---

### 5. 📺 YouTube Recommendations Feed
- **Topic Filter Chips**: Browse recommended videos by category: `All`, `Trending`, `Music`, `Gaming`, `Tech & AI`, `Nature 4K`, and `Sports`.
- **Rich Video Cards**: Displays channel avatars, verified channel names, view counts, publish dates, and video duration badges.
- **Instant Playback**: Click any card to instantly load and play the video in the gesture player.

---

### 6. 💬 Closed Captions (CC) & Subtitle Options
- **Default On**: Captions are automatically loaded and enabled by default (`cc_load_policy: 1`).
- **1-Click CC Toggle (`C`)**: Instant subtitle toggle with active state indicator.
- **Captions Options Menu (⚙️)**:
  - **Language Selector**: Choose between English, Spanish, French, German, Japanese, Chinese, or Auto-Generated tracks.
  - **Font Size Customization**: Small, Normal, Large, and XL font sizing.

### 7. 📌 Multi-Video Saved Markers & Yellow Timeline Dots
- **Cross-Video Bookmarks**: Save markers from any video with the video's real title, full YouTube timestamp URL (`https://youtu.be/{id}?t={time}`), and timestamp.
- **1-Click Video Switch & Jump**: Clicking a bookmark from another video automatically loads that video and seeks directly to the saved timestamp.
- **Filter Tabs**: Toggle between `All Videos` and `This Video` to quickly find your saved moments.
- **Yellow Dots on Timeline**: Saved bookmarks for the active video are displayed as bright yellow glowing dots along the scrubber timeline.
### 8. 💬 Side-by-Side Live Stream Chat & Replay Chat
- **Side-by-Side Theater Layout**: Watch the video and live/replay chat side-by-side on the right of the video.
- **Toggle Visibility**: Easily show or hide the chat sidebar with the toolbar **`💬`** button, header close button, or <kbd>Shift</kbd> + <kbd>C</kbd>.
- **⤢ Detached Pop-Out Window**: 1-click **Pop Out** button to open a dedicated floating chat popup that bypasses any domain embed limitations.
- **Automatic Sync**: Updates automatically whenever a new video or live stream is loaded.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Play / Pause |
| <kbd>C</kbd> | Toggle **Captions / Subtitles (CC)** |
| <kbd>Shift</kbd> + <kbd>C</kbd> | Toggle **Stream Chat Sidebar (Right of Video)** |
| <kbd>J</kbd> / <kbd>,</kbd> | Step **1 Frame Backward** ($\sim 0.04\text{s}$) |
| <kbd>K</kbd> / <kbd>.</kbd> | Step **1 Frame Forward** ($\sim 0.04\text{s}$) |
| <kbd>←</kbd> / <kbd>→</kbd> | Jump $-5\text{s}$ / $+5\text{s}$ |
| <kbd>H</kbd> / <kbd>L</kbd> | Jump $-10\text{s}$ / $+10\text{s}$ |
| <kbd>[</kbd> / <kbd>]</kbd> | Decrease / Increase speed by $0.25x$ |
| <kbd>R</kbd> | Toggle Live Reverse Playback |
| <kbd>M</kbd> | Mute / Unmute |
| <kbd>F</kbd> | Toggle Fullscreen |
| <kbd>?</kbd> / <kbd>/</kbd> | Open / Close Gesture Guide & Shortcuts |

---

## 📂 Project Structure

```
utube/
├── index.html          # Semantic HTML5 layout and control structure
├── style.css           # Obsidian theme, container queries, and responsive styles
├── app.js              # Application controller, event wiring, and state synchronization
├── player.js           # YouTube IFrame API controller, reverse engine, and bookmark store
├── gesture-engine.js   # 2D split-screen pointer and touch gesture engine
├── recommendations.js  # Categorized YouTube recommendation dataset
├── samples.js          # Sample video definitions
└── README.md           # Documentation
```

---

## 🚀 How to Run

1. Open [`utube/index.html`](file:///root/utube/index.html) directly in any modern web browser (Chrome, Firefox, Safari, Edge).
2. No installation, build process, or server setup is required.
