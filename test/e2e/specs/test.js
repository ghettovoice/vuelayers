// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
  'default e2e tests': function (browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .waitForElementVisible('#app', 3000)
      .pause(1000)
      .waitForElementPresent('.vl-map', 3000)
      // todo why nightwatch doesn't see inner ol-viewport element while it is already present
      // .pause(1000)
      // .waitForElementPresent('.vl-map .ol-viewport', 3000)
      .end()
  },
}
