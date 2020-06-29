// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
  'default e2e tests': function (browser) {
    browser
      .init()
      .waitForElementVisible('#app', 3000)
      .waitForElementPresent('.vl-map', 3000)
      .end()
  },
}
