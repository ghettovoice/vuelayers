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
/**
 * GitHub links helper
 */
hexo.extend.helper.register('ghUrl', function (user, pkg, type = 'repo', options = {}) {
  let baseUrl = `https://github.com/${user}/${pkg}`

  switch (type) {
    case 'download':
      if (options.tag) {
        return baseUrl + `/archive/${options.tag}.zip`
      }

      return baseUrl + `/archive/master.zip`
    case 'repo':
    default:
      return baseUrl
  }
})

hexo.extend.helper.register('npmUrl', function (pkg) {
  return `https://npmjs.org/package/${pkg}`
})
