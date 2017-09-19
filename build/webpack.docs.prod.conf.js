// This the Webpack config for docs production build
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')
const PreloadWebpackPlugin = require('preload-webpack-plugin')
const baseWebpackConfig = require('./webpack.base.conf')
const utils = require('./utils')
const config = require('./config')

const isProduction = process.env.NODE_ENV === 'production'

const webpackConfig = merge(baseWebpackConfig, {
  output: {
    path: utils.resolve('dist-docs'),
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js'),
  },
  resolve: {
    mainFields: ['module', 'main'],
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
  plugins: [
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
      filename: utils.assetsPath('css/[name].[contenthash].css'),
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin(),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: utils.resolve('dist-docs/index.html'),
      template: 'docs/index.ejs',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency',
      serviceWorker: `<script>${utils.getServiceWorkerSrc()}</script>`,
    }),
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: module => {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(utils.resolve('node_modules')) === 0
        )
      },
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor'],
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: utils.resolve('docs/static'),
        to: config.assetsSubDir,
        ignore: ['.*'],
      },
    ]),
    new PreloadWebpackPlugin({
      rel: 'prefetch',
    }),
    new SWPrecacheWebpackPlugin({
      cacheId: `${config.name}-docs-app`,
      filename: utils.assetsPath('js/service-worker.js'),
      minify: true,
      navigateFallback: config.publicPath,
      staticFileGlobsIgnorePatterns: [/dist-docs\/.*\.html/, /img\/\.cache$/],
    }),
  ],
})

webpackConfig.entry = {
  app: utils.resolve('docs/main.js'),
}

module.exports = (env = {}) => {
  if (env.report) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
  }

  return webpackConfig
}
