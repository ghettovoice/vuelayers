// see http://vuejs-templates.github.io/webpack for documentation.
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')
const packageJson = require('../package.json')

const entry = {
  [ packageJson.name ]: path.resolve(__dirname, '../src/index.js')
}

const banner =
  `${packageJson.fullname}
${packageJson.description}

@package ${packageJson.name}
@author ${packageJson.author}
@version ${packageJson.version}
@license ${packageJson.license}
@copyright (c) ${new Date().getFullYear()}, ${packageJson.author}
`

const modules = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, './modules.yml'), 'utf8'))

module.exports = {
  name: packageJson.name,
  fullname: packageJson.fullname,
  ns: 'vl',
  author: packageJson.author,
  version: packageJson.version,
  license: packageJson.license,
  banner,
  modules,
  build: {
    entry: entry,
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/index.html'),
    outPath: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'assets',
    publicPath: '/',
    productionSourceMap: true,
    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  },
  dev: {
    entry: Object.assign(
      {
        app: path.resolve(__dirname, '../test/main.js')
      },
      entry
    ),
    env: require('./dev.env'),
    port: 8081,
    autoOpenBrowser: true,
    assetsSubDirectory: 'assets',
    publicPath: '/',
    proxyTable: {},
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  }
}
