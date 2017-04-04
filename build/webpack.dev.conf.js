// This is webpack config for hot mode
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const utils = require('./utils')
const config = require('./config')
const baseWebpackConfig = require('./webpack.base.conf')

const webpackConfig = merge(baseWebpackConfig, {
  // cheap-module-eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  devServer: {
    publicPath: config.publicPath,
    host: config.host,
    port: config.port
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: utils.vueLoaderConfig()
      },
      ...utils.styleLoaders({
        sourceMap: true
      })
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
      PKG_NAME: `'${config.name}'`,
      PKG_FULLNAME: `'${config.fullname}'`,
      PKG_VERSION: `'${config.version}'`
    }),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'test/index.html',
      inject: true
    }),
    new FriendlyErrorsPlugin()
  ]
})

webpackConfig.entry = {
  app: utils.resolve('test/main.js')
}

module.exports = webpackConfig
