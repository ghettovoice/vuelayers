// This is the webpack config used for unit tests.
const webpack = require('webpack')
const merge = require('webpack-merge')
const utils = require('./utils')
const config = require('./config')
const baseWebpackConfig = require('./webpack.base.conf')

const webpackConfig = merge(baseWebpackConfig, {
  // use inline sourcemap for karma-sourcemap-loader
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: utils.vueLoaderConfig(),
      },
      ...utils.styleLoaders(),
    ],
  },
  devtool: '#inline-source-map',
  plugins: [
  ],
})

// no need for app entry during tests
delete webpackConfig.entry

module.exports = webpackConfig
