const webpack = require('webpack')
const WebpackNotifierPlugin = require('webpack-notifier')

module.exports = {
  entry: {
    home: 'themes/vl/source/js/main'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          'themes/vl/source/js'
        ]
      },
      ExtractTextPlugin.extract({
        use: [
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          }, {
            test: /\.s[ac]ss$/,
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      })
    ]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: 'VueLayers Docs',
      raw: true,
      entryOnly: true
    }),
    new WebpackNotifierPlugin({
      title: 'VueLayers Docs',
      alwaysNotify: true
    })
  ]
}
