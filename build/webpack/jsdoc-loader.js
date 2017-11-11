const path = require('path')
const jsdoc = require('jsdoc-api')
const loaderUtils = require('loader-utils')

module.exports = function () {
  const callback = this.async()
  this.cacheable && this.cacheable()

  const options = loaderUtils.getOptions(this) || {}
  const params = this.query ? loaderUtils.parseQuery(this.query) || {} : {}
  const opts = Object.assign({}, options, params)

  jsdoc.explain({
    files: this.resourcePath,
    cache: false,
    configure: path.join(process.cwd(), '.jsdoc.js'),
    ...opts,
  }).then(doclets => {
    let source = opts.raw ? JSON.stringify(doclets) : 'module.exports = ' + JSON.stringify(doclets)
    callback(null, source)
  }).catch(err => this.emitError(err))
}
