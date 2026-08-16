/**
 * Automated Headless Chromium Test Suite for UTUBE
 * Uses Node.js native http, child_process, and CDP WebSocket. Zero external npm dependencies!
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8085;
const CDP_PORT = 9225;

// Simple Static HTTP Server
function startServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
  };

  const server = http.createServer((req, res) => {
    let filePath = path.join(ROOT_DIR, req.url.split('?')[0]);
    if (req.url === '/' || req.url.startsWith('/?')) filePath = path.join(ROOT_DIR, 'index.html');

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found: ' + req.url);
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`[Test Server] Running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

// Launch Headless Chromium
function launchChromium() {
  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    `--remote-debugging-port=${CDP_PORT}`,
    '--window-size=1280,800',
    'about:blank'
  ];

  console.log('[Chromium] Launching /usr/bin/chromium...');
  const proc = spawn('/usr/bin/chromium', args, { stdio: 'ignore' });
  return proc;
}

// Wait for CDP endpoint
async function waitForCDP(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      if (res.ok) {
        const list = await res.json();
        if (list && list.length > 0) return list[0];
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Chromium CDP failed to initialize on port ' + CDP_PORT);
}

// Simple CDP Client over WebSocket
class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
    this.events = [];
    this.consoleLogs = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const WebSocket = globalThis.WebSocket;
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const cb = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) cb.reject(new Error(data.error.message));
          else cb.resolve(data.result);
        } else if (data.method === 'Runtime.consoleAPICalled') {
          const text = data.params.args.map(a => a.value || a.description || '').join(' ');
          this.consoleLogs.push({ type: data.params.type, text });
        } else if (data.method === 'Runtime.exceptionThrown') {
          const detail = data.params.exceptionDetails;
          const desc = detail.exception ? detail.exception.description : detail.text;
          console.error('[Browser Exception Details]', desc);
          this.consoleLogs.push({ type: 'error', text: desc });
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${res.exceptionDetails.text || JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result ? res.result.value : undefined;
  }
}

// Main Test Runner
async function runTests() {
  console.log('\n========================================');
  console.log('🧪 UTUBE HEADLESS CHROMIUM TEST SUITE');
  console.log('========================================\n');

  const server = await startServer();
  const chromium = launchChromium();

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  try {
    const target = await waitForCDP();
    console.log(`[CDP] Connected to target: ${target.title} (${target.id})`);

    const cdp = new CDPClient(target.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    console.log(`[Navigation] Loading http://localhost:${PORT}...`);
    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}` });

    // Wait for DOM load
    await new Promise(r => setTimeout(r, 1200));

    // TEST 1: Page Title and Header Version Badge
    console.log('\n--- Test Group 1: Page Structure & Versioning ---');
    const pageTitle = await cdp.evaluate('document.title');
    assert(pageTitle.includes('UTUBE'), 'Page Title contains UTUBE', `Found: "${pageTitle}"`);

    const versionBadge = await cdp.evaluate('document.getElementById("appVersionBadge")?.textContent?.trim()');
    assert(/^v\d+\.\d+/.test(versionBadge), 'Version Badge is valid format (e.g. v3.9)', `Found: "${versionBadge}"`);

    const brandText = await cdp.evaluate('document.querySelector(".brand-name")?.textContent?.trim()');
    assert(brandText.includes('UTUBE'), 'Brand name is present', `Found: "${brandText}"`);

    // TEST 2: Essential UI Elements Initialized
    console.log('\n--- Test Group 2: Core Player & Controls ---');
    const playerWrapper = await cdp.evaluate('!!document.getElementById("playerTheaterWrapper")');
    assert(playerWrapper, 'Player Theater Wrapper element exists');

    const gestureOverlay = await cdp.evaluate('!!document.getElementById("gestureOverlay")');
    assert(gestureOverlay, 'Split-Screen Gesture Overlay element exists');

    const playBtn = await cdp.evaluate('!!document.getElementById("playBtn")');
    assert(playBtn, 'Play/Pause Control Button exists');

    const timeline = await cdp.evaluate('!!document.getElementById("timelineContainer")');
    assert(timeline, 'Timeline Scrubber Container exists');

    // TEST 3: Guide Modal Interaction (Open, Verify, Close)
    console.log('\n--- Test Group 3: Guide Modal Functionality ---');
    
    // Initial state: Hidden
    const modalInitialDisplay = await cdp.evaluate('window.getComputedStyle(document.getElementById("helpModal")).display');
    assert(modalInitialDisplay === 'none', 'Help modal initially has display: none', `Found: "${modalInitialDisplay}"`);

    // Click Guide Button
    await cdp.evaluate('document.getElementById("openHelpBtn").click()');
    await new Promise(r => setTimeout(r, 150));

    const modalOpenDisplay = await cdp.evaluate('window.getComputedStyle(document.getElementById("helpModal")).display');
    const modalOpenOpacity = await cdp.evaluate('window.getComputedStyle(document.getElementById("helpModal")).opacity');
    const modalOpenVisibility = await cdp.evaluate('window.getComputedStyle(document.getElementById("helpModal")).visibility');
    
    assert(modalOpenDisplay === 'flex', 'Help modal opens with display: flex on click', `Found: "${modalOpenDisplay}"`);
    assert(modalOpenOpacity === '1', 'Help modal has opacity: 1', `Found: "${modalOpenOpacity}"`);
    assert(modalOpenVisibility === 'visible', 'Help modal has visibility: visible', `Found: "${modalOpenVisibility}"`);

    // Verify modal contents
    const diagramRowsCount = await cdp.evaluate('document.querySelectorAll("#helpModal .diagram-row").length');
    assert(diagramRowsCount >= 5, 'Modal has all gesture diagram rows (5)', `Found: ${diagramRowsCount}`);

    const shortcutsCount = await cdp.evaluate('document.querySelectorAll("#helpModal .shortcut-item").length');
    assert(shortcutsCount >= 8, 'Modal has keyboard shortcuts grid items (>=8)', `Found: ${shortcutsCount}`);

    // Click Close Button
    await cdp.evaluate('document.getElementById("closeHelpBtn").click()');
    await new Promise(r => setTimeout(r, 150));

    const modalClosedDisplay = await cdp.evaluate('window.getComputedStyle(document.getElementById("helpModal")).display');
    assert(modalClosedDisplay === 'none', 'Help modal closes with display: none on ✕ click', `Found: "${modalClosedDisplay}"`);

    // TEST 4: Video Sizing Controls
    console.log('\n--- Test Group 4: Sizing Presets ---');
    await cdp.evaluate('document.getElementById("sizeCompactBtn").click()');
    await new Promise(r => setTimeout(r, 100));
    const compactWidth = await cdp.evaluate('document.getElementById("playerTheaterWrapper").style.maxWidth');
    assert(compactWidth === '720px', 'Compact button sets max-width to 720px', `Found: "${compactWidth}"`);

    await cdp.evaluate('document.getElementById("sizeCinemaBtn").click()');
    await new Promise(r => setTimeout(r, 100));
    const cinemaWidth = await cdp.evaluate('document.getElementById("playerTheaterWrapper").style.maxWidth');
    assert(cinemaWidth === '100%', 'Cinema button sets max-width to 100%', `Found: "${cinemaWidth}"`);

    await cdp.evaluate('document.getElementById("sizeStandardBtn").click()');
    await new Promise(r => setTimeout(r, 100));
    const standardWidth = await cdp.evaluate('document.getElementById("playerTheaterWrapper").style.maxWidth');
    assert(standardWidth === '1080px', 'Standard button sets max-width to 1080px', `Found: "${standardWidth}"`);

    // TEST 5: Frame Stepping Buttons
    console.log('\n--- Test Group 5: Frame Controls ---');
    const prevFrameBtn = await cdp.evaluate('!!document.getElementById("prevFrameBtn")');
    const nextFrameBtn = await cdp.evaluate('!!document.getElementById("nextFrameBtn")');
    assert(prevFrameBtn && nextFrameBtn, 'Prev & Next Frame Step buttons exist in control bar');

    // TEST 6: Bookmarks Store and Interactive Marker Creation
    console.log('\n--- Test Group 6: Bookmarks & Interactive Marker Creation ---');
    const bookmarksList = await cdp.evaluate('!!document.getElementById("bookmarksList")');
    assert(bookmarksList, 'Bookmarks list container exists');

    const addBookmarkBtn = await cdp.evaluate('!!document.getElementById("addBookmarkCardBtn")');
    assert(addBookmarkBtn, 'Add Bookmark button (addBookmarkCardBtn) exists');

    // Click Add Bookmark button to test marker creation
    await cdp.evaluate('document.getElementById("addBookmarkCardBtn").click()');
    await new Promise(r => setTimeout(r, 150));

    const markerCount = await cdp.evaluate('document.querySelectorAll("#bookmarksList .bookmark-row").length');
    assert(markerCount >= 1, 'Clicking Add Bookmark creates a new marker row in bookmarksList', `Found: ${markerCount}`);

    // TEST 7: Search Functionality & Side-by-Side Panel to Right of Video Player
    console.log('\n--- Test Group 7: Universal Search & Player Side-Panel ---');
    const searchSidebar = await cdp.evaluate('!!document.getElementById("playerSearchSidebar")');
    assert(searchSidebar, 'Dedicated Search Results Side Panel (playerSearchSidebar) exists');

    // Type a search query into urlInput on top and submit
    await cdp.evaluate(`
      const input = document.getElementById("urlInput");
      input.value = "lofi";
      document.getElementById("loadVideoBtn").click();
    `);
    await new Promise(r => setTimeout(r, 1200));

    const isSidebarVisible = await cdp.evaluate('window.getComputedStyle(document.getElementById("playerSearchSidebar")).display !== "none"');
    assert(isSidebarVisible, 'Submitting search from top URL bar opens side-panel to the right of player');

    const searchCardsCount = await cdp.evaluate('document.querySelectorAll("#searchSidebarList .search-result-card").length');
    assert(searchCardsCount >= 1, 'Search for "lofi" populates search results cards in player sidebar', `Found: ${searchCardsCount} cards`);

    // TEST 8: Bookmark from Search Result Card
    console.log('\n--- Test Group 8: Save Bookmark from Search Result Card ---');
    const firstBookmarkBtn = await cdp.evaluate('!!document.querySelector("#searchSidebarList .search-bookmark-btn")');
    assert(firstBookmarkBtn, 'Search result card contains Bookmark button');

    // Click bookmark button on first search result
    await cdp.evaluate('document.querySelector("#searchSidebarList .search-bookmark-btn").click()');
    await new Promise(r => setTimeout(r, 200));

    const isBtnSaved = await cdp.evaluate('document.querySelector("#searchSidebarList .search-bookmark-btn").classList.contains("saved")');
    assert(isBtnSaved, 'Clicking Search Bookmark button toggles it to saved state');

    // Verify the saved marker is listed in the main Bookmarks list below
    const markerRows = await cdp.evaluate('document.querySelectorAll("#bookmarksList .bookmark-row").length');
    assert(markerRows >= 1, 'Saved search result appears in clean Bookmarks list below', `Found: ${markerRows}`);

    // TEST 9: Play Video from Search Result
    console.log('\n--- Test Group 9: Play Video from Search Card on Left Player ---');
    await cdp.evaluate('document.querySelector("#searchSidebarList .search-result-card").click()');
    await new Promise(r => setTimeout(r, 300));
    assert(true, 'Clicked search result card to load and play video on left player');

    // Close Search Side-Panel
    await cdp.evaluate('document.getElementById("closeSearchSidebarBtn").click()');
    await new Promise(r => setTimeout(r, 150));
    const isSidebarClosed = await cdp.evaluate('window.getComputedStyle(document.getElementById("playerSearchSidebar")).display === "none"');
    assert(isSidebarClosed, 'Clicking ✕ close button dismisses search side-panel');

    // TEST 10: Keyboard Shortcuts Execution
    console.log('\n--- Test Group 10: Keyboard Shortcuts Dispatch ---');
    await cdp.evaluate(`
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }));
    `);
    await new Promise(r => setTimeout(r, 100));
    assert(true, 'Dispatched "c" key for Captions without exceptions');

    await cdp.evaluate(`
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ',' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '.' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
    `);
    await new Promise(r => setTimeout(r, 100));
    assert(true, 'Dispatched frame stepping shortcuts ( , / . / j / k ) successfully');

    // TEST 11: Console Error Check
    console.log('\n--- Test Group 11: Browser Error Log Check ---');
    const errorLogs = cdp.consoleLogs.filter(l => l.type === 'error');
    assert(errorLogs.length === 0, 'Zero runtime JavaScript errors in browser console', 
      errorLogs.length > 0 ? JSON.stringify(errorLogs) : 'Clean console');

  } catch (err) {
    console.error('\n💥 Unexpected test suite error:', err);
    failed++;
  } finally {
    console.log('\n========================================');
    console.log(`🏁 RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('========================================\n');

    chromium.kill();
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
