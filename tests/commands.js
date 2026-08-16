/**
 * Static Test Commands & Actions for Screenshot Capturer
 * Modify this file to change what is evaluated before the screenshot.
 */
module.exports = {
  outputPath: '/tmp/utube-screenshot.png',
  windowSize: { width: 1600, height: 950 },
  async run(cdp) {
    // Wait for initial page hydration
    await new Promise(r => setTimeout(r, 800));
    // Search for python to verify real relevant programming videos are returned
    await cdp.evaluate(`
      const inp = document.getElementById('urlInput');
      inp.value = 'python';
      document.getElementById('loadVideoBtn').click();
    `);
    await new Promise(r => setTimeout(r, 800));
  }
};
