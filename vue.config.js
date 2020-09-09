const reduce = require('lodash/reduce')
const utils = require('./build/utils')
const config = require('./build/config')

module.exports = {
  pages: {
    app: {
      title: 'VueLayers test app',
      entry: utils.resolve('tests/main.js'),
      template: utils.resolve('tests/index.html'),
      filename: 'index.html',
    },
  },
  chainWebpack: wc => {
    /* eslint-disable indent */
    wc.module
      .rule('string-replace')
      .test(/\.(js|vue|s?css)$/)
      .use('string-replace-loader')
        .loader('string-replace-loader')
        .options({
          multiple: reduce(config.replaces, (all, replace, search) => {
            return all.concat({ replace, search, flags: 'g' })
          }, []),
        })

    wc
      .plugin('define')
      .tap(args => {
        args[0]['process.env'].VUELAYERS_DEBUG = process.env.NODE_ENV !== 'production'
        return args
      })
    /* eslint-enable indent */
  },
}
