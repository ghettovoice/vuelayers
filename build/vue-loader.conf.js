const utils = require('./utils')
const config = require('../config')
const isProduction = process.env.NODE_ENV === 'production'
const minify = isProduction && process.argv.includes('--min')

module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: isProduction
      ? config.build.productionSourceMap
      : config.dev.cssSourceMap,
    extract: isProduction,
    minimize: minify
  }),
  postcss: [
    require('autoprefixer')({
      browsers: ['last 10 versions']
    })
  ]
}
