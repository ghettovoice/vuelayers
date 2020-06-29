const utils = require('./build/utils')

module.exports = {
  pages: {
    app: {
      title: 'VueLayers test app',
      entry: utils.resolve('tests/main.js'),
      template: utils.resolve('tests/index.html'),
      filename: 'index.html',
    },
  },
}
