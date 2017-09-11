// This is webpack config for docs hot mode
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const PreloadWebpackPlugin = require('preload-webpack-plugin')
const baseWebpackConfig = require('./webpack.base.conf')
const utils = require('./utils')

const webpackConfig = merge(baseWebpackConfig, {
  // cheap-module-eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: utils.vueLoaderConfig(),
      },
      ...utils.styleLoaders({
        sourceMap: true,
      }),
    ],
  },
  plugins: [
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'docs/index.ejs',
      inject: true,
      serviceWorker: '',
    }),
    new FriendlyErrorsPlugin(),
    new PreloadWebpackPlugin({
      rel: 'prefetch',
    }),
  ],
})

webpackConfig.entry = {
  app: [
    './build/dev-client',
    utils.resolve('docs/main.js'),
  ],
}

module.exports = webpackConfig
