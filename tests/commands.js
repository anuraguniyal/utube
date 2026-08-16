/**
 * Static Test Commands & Actions for Screenshot Capturer
 * Modify this file to change what is evaluated before the screenshot.
 */
module.exports = {
  outputPath: '/tmp/utube-screenshot.png',
  windowSize: { width: 1600, height: 950 },
  async run(cdp) {
    // Search for 4k to show multiple search results cards in the player sidebar
    await cdp.evaluate(`
      window.executeSearch('4k');
    `);
    await new Promise(r => setTimeout(r, 600));
  }
};
