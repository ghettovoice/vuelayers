const {template} = require('lodash/fp')
const loaderUtils = require('loader-utils')

module.exports = function (source) {
  this.cacheable && this.cacheable()

  const options = loaderUtils.getOptions(this) || {}
  const params = this.query ? loaderUtils.parseQuery(this.query) || {} : {}
  const opts = Object.assign({}, options, params)
  const data = this.options.jsdocData[opts.id] || {}

  this.addDependency(data.file)

  let tplFunc = template(source, {
    imports: Object.assign({}, opts.helper),
  })
  source = tplFunc(data)

  return opts.raw ? source : `module.exports = ${JSON.stringify(source)}`
}
