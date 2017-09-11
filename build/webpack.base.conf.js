const webpack = require('webpack')
const WebpackNotifierPlugin = require('webpack-notifier')
const StringReplacePlugin = require('string-replace-webpack-plugin')
const utils = require('./utils')
const config = require('./config')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  entry: {
    [ config.name ]: config.entry,
  },
  devtool: '#source-map',
  output: {
    path: config.outDir,
    filename: isProduction ? '[name].min.js' : '[name].js',
    publicPath: config.publicPath,
  },
  resolve: {
    extensions: ['.js', '.vue', '.json', '.md'],
    modules: [
      utils.resolve('src'),
      utils.resolve('docs'),
      utils.resolve('node_modules'),
    ],
    alias: {
      [ config.name ]: utils.resolve(''),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|vue|md)$/,
        loader: utils.compileVarsReplaceLoader(),
        enforce: 'pre',
        include: [
          utils.resolve('src'),
          utils.resolve('docs'),
          utils.resolve('test'),
        ],
      },
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [
          utils.resolve('src'),
          utils.resolve('docs'),
          utils.resolve('test'),
        ],
        options: {
          formatter: require('eslint-friendly-formatter'),
        },
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          utils.resolve('src'),
          utils.resolve('docs'),
          utils.resolve('test'),
          utils.resolve('node_modules/ol-tilecache'),
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]'),
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]'),
        },
      },
      {
        test: /\.md$/,
        loader: 'vue-markdown-loader',
        options: utils.vueMarkdownLoaderConfig(),
      },
      {
        test: /\.(json|geojson)$/,
        loader: 'json-loader',
      },
    ],
    noParse: [/openlayers/],
  },
  plugins: [
    new StringReplacePlugin(),
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin(Object.assign({}, config.replaces, {
      'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
    })),
    new webpack.BannerPlugin({
      banner: config.banner,
      raw: true,
      entryOnly: true,
    }),
    new WebpackNotifierPlugin({
      title: config.fullname,
      alwaysNotify: true,
    }),
  ],
}
