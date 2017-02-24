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

let componentsList = utils.getDirectories(path.resolve(__dirname, '../src/components'))
let utilsList = fs.readdirSync(path.resolve(__dirname, '../src/utils'))
let mixinsList = fs.readdirSync(path.resolve(__dirname, '../src/mixins'))

let entry = baseWebpackConfig.entry = {
  ol: path.resolve(__dirname, '../src/ol'),
  rx: path.resolve(__dirname, '../src/rx')
}
let externals = {
  [ `${config.name}/src/ol` ]: `${config.name}/dist/ol`,
  [ `${config.name}/src/rx` ]: `${config.name}/dist/rx`
}

// add components entries
componentsList.forEach(component => {
  baseWebpackConfig.entry[ component ] = path.resolve(__dirname, '../src/components', component)
  externals[ `${config.name}/src/components/${component}` ] = `${config.name}/dist/components/${component}`
})

// utils as modules
utilsList.forEach(function (file) {
  file = path.basename(file, '.js')
  baseWebpackConfig.entry[ `utils/${file}` ] = path.resolve(__dirname, `../src/utils/`, file)
  externals[ `${config.name}/src/utils/${file}` ] = `${config.name}/dist/utils/${file}`
})
// mixins as modules
mixinsList.forEach(function (file) {
  file = path.basename(file, '.js')
  baseWebpackConfig.entry[ `mixins/${file}` ] = path.resolve(__dirname, `../src/mixins/`, file)
  externals[ `${config.name}/src/utils/${file}` ] = `${config.name}/dist/mixins/${file}`
})

const webpackConfig = merge(baseWebpackConfig, {
  entry,
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
