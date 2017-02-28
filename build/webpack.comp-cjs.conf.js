// This the Webpack config for building UMD components
const fs = require('fs')
const path = require('path')
const upperFirst = require('lodash/fp/upperFirst')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const baseWebpackConfig = require('./webpack.base.conf')

const isProduction = process.env.NODE_ENV === 'production'
const env = isProduction ? config.build.env : config.dev.env
// add each module as entry
baseWebpackConfig.entry = {}
let externals = {}

config.modules.map.forEach(mod => {
  baseWebpackConfig.entry[ mod.name ] = path.resolve(__dirname, '../src', mod.path)
  externals[ `${config.name}/src/${mod.path}` ] = `${config.name}/dist/${mod.name}`
})

const webpackConfig = merge(baseWebpackConfig, {
  output: {
    filename: '[name]/index.js',
    library: '[name]',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true
    })
  },
  externals: [
    externals,
    nodeExternals()
  ],
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: '[name]/style.css'
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
