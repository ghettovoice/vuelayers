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
    path: config.outputPath,
    filename: isProduction ? '[name].min.js' : '[name].js',
    publicPath: config.publicPath,
  },
  resolve: {
    extensions: ['.js', '.vue', '.json', '.md'],
    modules: [
      utils.resolve('src'),
      'node_modules',
    ],
    alias: {
      '@': utils.resolve('src'),
    },
  },
  resolveLoader: {
    modules: [
      utils.resolve('build/webpack'),
      utils.resolve('node_modules'),
    ],
  },
  module: {
    rules: [
      {
        test: /\.(js|vue|md)$/,
        use: [
          utils.compileVarsReplaceLoader(),
          {
            loader: 'ifdef-loader',
            options: {
              IS_STANDALONE: false,
              'ifdef-triple-slash': false,
            },
          },
        ],
        enforce: 'pre',
        include: [
          utils.resolve('src'),
          utils.resolve('test'),
        ],
      },
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [
          utils.resolve('src'),
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
          utils.resolve('test'),
        ],
      },
    ],
    noParse: [/openlayers/],
  },
  plugins: [
    // new NpmInstallPlugin(),
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
      alwaysNotify: false,
    }),
  ],
}
