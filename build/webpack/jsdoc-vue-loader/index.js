const path = require('path')

module.exports = function (source) {
  this.cacheable && this.cacheable()
  const loaderPath = path.resolve(__dirname, './loader.js')

  return `module.exports = require('!vue-loader!${loaderPath}!${this.resourcePath}${this.resourceQuery}')`
}
