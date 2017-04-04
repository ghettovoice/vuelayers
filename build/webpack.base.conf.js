const path = require('path')
const webpack = require('webpack')
const utils = require('./utils')
const WebpackNotifierPlugin = require('webpack-notifier')
const config = require('./config')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  entry: {
    [ config.name ]: config.entry
  },
  devtool: '#source-map',
  output: {
    path: config.outDir,
    filename: '[name].js',
    publicPath: config.publicPath
  },
  resolve: {
    extensions: [ '.js', '.vue', '.json' ],
    modules: [
      utils.resolve('src'),
      utils.resolve('node_modules')
    ],
    alias: {
      [ config.name ]: utils.resolve('')
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: "pre",
        include: [ utils.resolve('src'), utils.resolve('test') ],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          utils.resolve('src'),
          utils.resolve('test'),
          utils.resolve('node_modules/ol-tilecache')
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(geo)?json$/,
        loader: 'json-loader'
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: config.banner,
      raw: true,
      entryOnly: true
    }),
    new WebpackNotifierPlugin({
      title: config.fullname,
      alwaysNotify: true
    })
  ]
}
