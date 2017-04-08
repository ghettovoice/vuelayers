const argv = require('yargs').argv

const config = require('./config')
process.env.NODE_ENV || (process.env.NODE_ENV = 'development')

const opn = require('opn')
let path = require('path')
const express = require('express')
const webpack = require('webpack')
let webpackConfig = process.env.NODE_ENV === 'testing'
  ? require('./webpack.prod.conf')
  : ( argv.conf
    ? require(`./webpack.${argv.conf}.conf`)
    : require('./webpack.dev.conf') )

if (typeof webpackConfig === 'function') {
  webpackConfig = webpackConfig()
}

// default port where dev server listens for incoming traffic
const port = process.env.PORT || config.port
// automatically open browser, if not set will be false
const autoOpenBrowser = config.autoOpenBrowser

const app = express()
const compiler = webpack(webpackConfig)

const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {}
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

const uri = 'http://' + config.host + ':' + port

devMiddleware.waitUntilValid(function () {
  console.log('> Listening at ' + uri + '\n')
})

module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }

  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
})
