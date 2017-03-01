// This the Webpack config for building UMD all-in-one lib
const fs = require('fs')
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const nodeExternals = require('webpack-node-externals')

const isProduction = process.env.NODE_ENV === 'production'
const env = isProduction ? config.build.env : config.dev.env

const webpackConfig = merge(baseWebpackConfig, {
  target: 'node',
  output: {
    filename: 'cjs/index.js',
    library: config.fullname,
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true
    })
  },
  externals: [
    nodeExternals()
  ],
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      PKG_NAME: `"${config.name}"`,
      PKG_FULLNAME: `"${config.fullname}"`,
      PKG_VERSION: `"${config.version}"`
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: 'cjs/style.css'
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin(),
    new webpack.BannerPlugin(config.banner)
  ]
})

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
