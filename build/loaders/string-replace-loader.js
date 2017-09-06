const loaderUtils = require('loader-utils')

module.exports = function (source, map) {
  const callback = this.async()
  this.cacheable && this.cacheable()
  const options = loaderUtils.getOptions(this) || {}

  if (typeof source === 'string') {
    source = Object.keys(options.replaces || {})
      .reduce(
        (out, token) => out.replace(token, options.replaces[token]),
        source
      )
  }

  callback(null, source, map)
}
