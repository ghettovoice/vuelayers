require('./check-versions')()

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const ora = require('ora')
let path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const config = require('../config')
const argv = require('yargs').argv

const minify = process.env.NODE_ENV === 'production' && argv.min
const configFile = `webpack.${argv.conf || 'prod'}.conf`
const webpackConfig = require(path.join(__dirname, configFile))

const msg = `building from config ${configFile} ${minify ? 'with minify' : 'without minify'} in ${process.env.NODE_ENV} env...`
const spinner = ora(msg)
spinner.start()

webpack(webpackConfig, function (err, stats) {
  spinner.stop()

  if (err) throw err

  process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')

  console.log(chalk.cyan('  Build complete.\n'))
  console.log(chalk.yellow(
    '  Tip: built files are meant to be served over an HTTP server.\n' +
    '  Opening index.html over file:// won\'t work.\n'
  ))
})
