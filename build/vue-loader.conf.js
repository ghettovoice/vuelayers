const utils = require('./utils')
const config = require('./config')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: true,
    extract: isProduction
  }),
  postcss: [
    require('autoprefixer')({
      browsers: ['last 5 versions']
    })
  ]
}
