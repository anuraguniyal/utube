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
    // Click Compact Mode
    await cdp.evaluate(`document.getElementById("sizeCompactBtn").click()`);
    await new Promise(r => setTimeout(r, 600));
  }
};
