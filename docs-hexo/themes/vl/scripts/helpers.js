/* global hexo */
const _ = require('lodash')
/**
 * Extended Js helper
 */
hexo.extend.helper.register('js', function (src, attrs = {}) {
  let scripts = Array.isArray(src) ? src : [ { src, attrs } ]

  return scripts.map(({ src, attrs }) => {
    let attrsStr = _.reduce(attrs, (str, value, name) => {
      if (_.isBoolean(value)) {
        str.push(name)
      } else {
        str.push(name + '="' + value + '"')
      }

      return str
    }, []).join(' ')

    if (!src.match(/^(\/|http).*/)) {
      src = this.config.root + src
    }

    if (!src.match(/\.js$/)) {
      src += '.js'
    }

    return `<script src="${src}" ${attrsStr}></script>`
  })
})
