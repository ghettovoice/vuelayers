// This is webpack config for hot mode
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const baseWebpackConfig = require('./webpack.base.config')
const utils = require('./utils')

const webpackConfig = merge(baseWebpackConfig, {
  // devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'test/index.html',
      inject: true,
    }),
  ],
})

webpackConfig.entry = {
  app: utils.resolve('test/main.js'),
}

module.exports = webpackConfig
