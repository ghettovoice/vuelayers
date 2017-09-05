// This the Webpack config for building UMD all-in-one lib
const webpack = require('webpack')
const merge = require('webpack-merge')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const utils = require('./utils')
const config = require('./config')
const baseWebpackConfig = require('./webpack.base.conf')

const isProduction = process.env.NODE_ENV === 'production'

const webpackConfig = merge(baseWebpackConfig, {
  devtool: '#source-map',
  entry: {
    [ config.name ]: config.cjsEntry,
  },
  output: {
    filename: isProduction ? '[name].umd.min.js' : '[name].umd.js',
    library: config.fullname,
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: utils.vueLoaderConfig(true),
      },
      ...utils.styleLoaders({
        sourceMap: true,
        extract: isProduction,
      }),
    ],
  },
  externals: {
    vue: {
      root: 'Vue',
      amd: 'vue',
      commonjs: 'vue',
      commonjs2: 'vue',
    },
    openlayers: {
      root: 'ol',
      amd: 'openlayers',
      commonjs: 'openlayers',
      commonjs2: 'openlayers',
    },
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin(Object.assign(config.replaces, {
      'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
    })),
    ...(isProduction ? [
      new webpack.optimize.UglifyJsPlugin({
        mangle: true,
        sourceMap: true,
        compress: {
          warnings: false,
        },
      }),
    ] : []),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: isProduction ? '[name].umd.min.css' : '[name].umd.css',
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin(),
  ],
})

module.exports = (env = {}) => {
  if (env.report) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
  }

  return webpackConfig
}
