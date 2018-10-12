// This is the webpack config used for unit tests.
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.config')

const webpackConfig = merge(baseWebpackConfig, {
  // use inline sourcemap for karma-sourcemap-loader
  devtool: '#inline-source-map',
})

// no need for app entry during tests
delete webpackConfig.entry

module.exports = webpackConfig
