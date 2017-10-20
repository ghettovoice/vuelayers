const path = require('path')
const template = require('lodash/fp/template')
const loaderUtils = require('loader-utils')

const templateWithSettings = template.convert({fixed: false, rearg: false})

module.exports = function (source) {
  this.cacheable && this.cacheable()

  const options = loaderUtils.getOptions(this) || {}
  const params = this.query ? loaderUtils.parseQuery(this.query) || {} : {}
  const opts = Object.assign({}, options, params)
  const data = this.options.jsdocData[opts.id] || {}

  this.addDependency(data.file)
  let tplFunc = templateWithSettings(source, {
    imports: {
      require: moduleId => {
        if (!path.isAbsolute(moduleId)) {
          moduleId = path.resolve(this.context, moduleId)
        }

        return require(moduleId)
      },
    },
  })
  source = tplFunc(data)

  return opts.raw ? source : `module.exports = ${JSON.stringify(source)}`
}
