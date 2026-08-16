/**
 * UTUBE Headless Screenshot Capturer
 * Usage: node tests/capture-screenshot.js [filename] [action]
 * Example: node tests/capture-screenshot.js search.png "executeSearch('lofi')"
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8099;
const ROOT_DIR = path.resolve(__dirname, '..');
const outputFile = process.argv[2] || '/tmp/utube-screenshot.png';
const evalAction = process.argv[3] || null;
const outputPath = path.isAbsolute(outputFile) ? outputFile : path.join('/tmp', outputFile);

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
  const server = await startServer();
  console.log(`[Server] Running at http://localhost:${PORT}`);

  const chromium = spawn('/usr/bin/chromium', [
    '--headless=new',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--remote-debugging-port=9245',
    '--window-size=1280,800',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1000));

  try {
    const listRes = await fetch('http://127.0.0.1:9245/json/list');
    const targets = await listRes.json();
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

    await send('Page.enable');
    await send('Page.navigate', { url: `http://localhost:${PORT}` });
    await new Promise(r => setTimeout(r, 1200));

    if (evalAction) {
      console.log(`[Action] Evaluating: ${evalAction}`);
      await send('Runtime.evaluate', { expression: evalAction, awaitPromise: true });
      await new Promise(r => setTimeout(r, 600));
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
