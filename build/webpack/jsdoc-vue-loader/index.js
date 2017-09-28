const path = require('path')

module.exports = function () {
  this.cacheable && this.cacheable()
  const loaderPath = path.resolve(__dirname, './loader.js')

  return `module.exports = require('!vue-loader!${loaderPath}!${this.resource}')`
}
