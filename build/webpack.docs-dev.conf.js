// This is webpack config for HMR running docs
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const utils = require('./utils')
const config = require('./config')
const baseWebpackConfig = require('./webpack.base.conf')

baseWebpackConfig.entry = {
  app: path.resolve(__dirname, '../docs/src/main.js')
}
// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[ name ] = [ './build/dev-client' ].concat(baseWebpackConfig.entry[ name ])
})

module.exports = merge(baseWebpackConfig, {
  output: {
    path: path.resolve(__dirname, '../dist-docs')
  },
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.DefinePlugin(Object.assign(config.replaces, {
      'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`
    })),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'docs/index.html',
      inject: true
    }),
    new FriendlyErrorsPlugin()
  ]
})

webpackConfig.entry = {
  app: [
    './build/dev-client',
    utils.resolve('docs/main.js')
  ]
}

module.exports = webpackConfig
