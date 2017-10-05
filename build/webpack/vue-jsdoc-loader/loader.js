const path = require('path')
const loaderUtils = require('loader-utils')

module.exports = function (source) {
  this.cacheable && this.cacheable()

  const options = loaderUtils.getOptions(this) || {}
  const params = this.query ? loaderUtils.parseQuery(this.query) || {} : {}
  const opts = Object.assign({}, options, params)

  let doclets = JSON.parse(source)
  let tplPath = opts.tpl
  if (!path.isAbsolute(tplPath)) {
    tplPath = path.resolve(process.cwd(), tplPath)
  }

  let templateLoader = path.resolve(__dirname, './template.js')
  this.options.jsdocData = {
    doclets,
    file: this.resourcePath,
  }

  return `module.exports = require('!vue-loader!${templateLoader}?raw!${tplPath}')`
}
