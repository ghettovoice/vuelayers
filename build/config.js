/**
 * Shared config
 */
const utils = require('./utils')
const packageJson = require('../package.json')

const banner =
  `/*!
${packageJson.fullname}
${packageJson.description}

@package ${packageJson.name}
@author ${packageJson.author}
@version ${packageJson.version}
@license ${packageJson.license}
@copyright (c) ${new Date().getFullYear()}, ${packageJson.author}
*/`

module.exports = {
  banner,
  name: packageJson.name,
  fullname: packageJson.fullname,
  author: packageJson.author,
  version: packageJson.version,
  license: packageJson.license,
  entry: utils.resolve('src/index.js'),
  outDir: utils.resolve('dist'),
  publicPath: '/',
  assetsSubDir: 'static',
  host: 'localhost',
  port: 8081
}
