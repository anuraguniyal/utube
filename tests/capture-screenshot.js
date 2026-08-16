/**
 * UTUBE Static Headless Screenshot Capturer
 * Reads instructions from tests/commands.js (no dynamic CLI arguments required).
 * Usage: node tests/capture-screenshot.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8099;
const ROOT_DIR = path.resolve(__dirname, '..');
const COMMANDS_FILE = path.join(__dirname, 'commands.js');

function loadCommands() {
  try {
    delete require.cache[require.resolve(COMMANDS_FILE)];
    return require(COMMANDS_FILE);
  } catch (e) {
    return {
      outputPath: '/tmp/utube-screenshot.png',
      windowSize: { width: 1600, height: 950 },
      async run() {}
    };
  }
}

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath === '/' || reqPath.startsWith('/?')) reqPath = '/index.html';
      const filePath = path.join(ROOT_DIR, reqPath);

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
          return;
        }
        let contentType = 'text/html';
        if (filePath.endsWith('.css')) contentType = 'text/css';
        if (filePath.endsWith('.js')) contentType = 'text/javascript';
        if (filePath.endsWith('.png')) contentType = 'image/png';
        if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    });

    server.listen(PORT, () => resolve(server));
  });
}

async function capture() {
  const config = loadCommands();
  const outputPath = config.outputPath || '/tmp/utube-screenshot.png';
  const width = (config.windowSize && config.windowSize.width) || 1600;
  const height = (config.windowSize && config.windowSize.height) || 950;

  const server = await startServer();
  console.log(`[Server] Running at http://localhost:${PORT}`);

  const chromium = spawn('/usr/bin/chromium', [
    '--headless=new',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--remote-debugging-port=9245',
    `--window-size=${width},${height}`,
    'about:blank'
  ]);

  let targets = null;
  for (let retry = 0; retry < 15; retry++) {
    try {
      await new Promise(r => setTimeout(r, 250));
      const listRes = await fetch('http://127.0.0.1:9245/json/list');
      if (listRes.ok) {
        targets = await listRes.json();
        if (targets && targets.length > 0) break;
      }
    } catch (e) {}
  }

  if (!targets || targets.length === 0) {
    console.error('Could not connect to Chromium CDP port 9245');
    chromium.kill();
    server.close();
    return;
  }

  try {
    const target = targets[0];
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const onMsg = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === id) {
            ws.removeEventListener('message', onMsg);
            resolve(data.result);
          }
        };
        ws.addEventListener('message', onMsg);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    const cdp = {
      send,
      evaluate: (expr) => send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })
    };

    await send('Page.enable');
    await send('Page.navigate', { url: `http://localhost:${PORT}` });
    await new Promise(r => setTimeout(r, 1200));

    if (typeof config.run === 'function') {
      console.log(`[Commands] Executing actions from tests/commands.js...`);
      await config.run(cdp);
    }

    const ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outputPath, Buffer.from(ss.data, 'base64'));
    console.log(`📸 Screenshot saved successfully to: ${outputPath}`);

  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    chromium.kill();
    server.close();
  }
}

capture();
