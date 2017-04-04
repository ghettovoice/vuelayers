// This the Webpack config for running e2e tests
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const config = require('./config')
const baseWebpackConfig = require('./webpack.base.conf')

const isProduction = process.env.NODE_ENV === 'production'

const webpackConfig = merge(baseWebpackConfig, {
  devtool: '#source-map',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: utils.vueLoaderConfig(true)
      },
      ...utils.styleLoaders({
        sourceMap: true,
        extract: isProduction
      })
    ]
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
      PKG_NAME: `'${config.name}'`,
      PKG_FULLNAME: `'${config.fullname}'`,
      PKG_VERSION: `'${config.version}'`
    }),
    new webpack.optimize.UglifyJsPlugin({
      mangle: true,
      compress: {
        warnings: false
      },
      sourceMap: true
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: '[name].css'
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin(),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'test/index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    })
  ]
})

webpackConfig.entry = {
  app: utils.resolve('test/main.js')
}

module.exports = (env = {}) => {
  if (env.report) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
  }

  return webpackConfig
}
