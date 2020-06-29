const webpack = require('webpack')
const StringReplacePlugin = require('string-replace-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const utils = require('./utils')
const config = require('./config')

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
process.env.EFF_ABSOLUTE_PATHS = process.env.EFF_ABSOLUTE_PATHS || true

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  entry: {
    [config.name]: config.entry,
  },
  mode: ['production', 'development'].includes(process.env.NODE_ENV)
    ? process.env.NODE_ENV
    : 'development',
  devtool: '#source-map',
  output: {
    path: config.outputPath,
    filename: isProduction ? '[name].min.js' : '[name].js',
    publicPath: config.publicPath,
    hotUpdateChunkFilename: '[hash].hot-update.js',
    crossOriginLoading: 'anonymous',
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
  optimization: {
    minimizer: [
      new TerserPlugin(),
      // Compress extracted CSS. We are using this plugin so that possible
      // duplicated CSS from different components can be deduped.
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          map: { inline: false },
        },
      }),
    ],
  },
  module: {
    rules: [
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
        test: /\.(js|vue|s?[ca]ss)$/,
        loader: utils.compileVarsReplaceLoader(),
        enforce: 'pre',
        include: [
          utils.resolve('src'),
          utils.resolve('test'),
        ],
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          utils.resolve('src'),
          utils.resolve('test'),
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: utils.vueLoaderConfig(isProduction),
      },
      ...utils.styleLoaders({
        sourceMap: isProduction,
      }),
    ],
    noParse: [/openlayers/],
  },
  plugins: [
    new VueLoaderPlugin(),
    // new NpmInstallPlugin(),
    new StringReplacePlugin(),
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin(Object.assign({}, config.replaces, {
      'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
      'process.env.VUELAYERS_DEBUG': process.env.NODE_ENV !== 'production',
    })),
    new webpack.BannerPlugin({
      banner: config.banner,
      raw: true,
      entryOnly: true,
    }),
  ],
  performance: {
    maxEntrypointSize: 1024 * 1024, // 1Mb
    maxAssetSize: 10 * 1024 * 1024, // 10Mb
  },
  stats: {
    colors: true,
    children: false,
    chunks: false,
    modules: false,
    chunkModules: false,
  },
  devServer: {
    open: true,
    hot: true,
    contentBase: config.outputPath,
    clientLogLevel: 'info',
    compress: true,
    overlay: { warnings: false, errors: true },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
}
