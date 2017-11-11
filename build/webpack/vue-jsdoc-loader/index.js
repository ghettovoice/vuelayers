const path = require('path')

module.exports = function () {
  this.cacheable && this.cacheable()
  const loaderPath = path.resolve(__dirname, './loader.js')
  let query = this.query ? this.query + '&raw' : '?raw'

  return `module.exports = require('!${loaderPath}${query}!jsdoc-loader?raw!${this.resource}')`
}
