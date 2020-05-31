const argv = require('yargs').argv

const config = require('./config')
process.env.NODE_ENV || (process.env.NODE_ENV = 'development')

const opn = require('opn')
const express = require('express')
const webpack = require('webpack')
let webpackConfig = process.env.NODE_ENV === 'integration'
  ? require('./webpack.dev.config')
  : (argv.name
    ? require(`./webpack.${argv.name}.dev.conf`)
    : require('./webpack.dev.config'))

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
  logLevel: 'warn',
})

const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: false,
  heartbeat: 2000,
})
// force page reload when html-webpack-plugin template changes
// compiler.plugin('compilation', function (compilation) {
//   compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
//     hotMiddleware.publish({ action: 'reload' })
//     cb()
//   })
// })

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

const uri = 'http://' + config.host + ':' + port

console.log('> Starting dev server...')
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
