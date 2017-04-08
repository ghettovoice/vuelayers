/**
 * Shared config
 */
const path = require('path')
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
  entry: path.join(__dirname, '../src/index.js'),
  defEntry: path.join(__dirname, '../src/index.def.js'),
  outDir: path.join(__dirname, '../dist'),
  publicPath: '/',
  assetsSubDir: 'static',
  host: 'localhost',
  port: 8081,
  replaces: {
    PKG_NAME: `'${packageJson.name}'`,
    PKG_FULLNAME: `'${packageJson.fullname}'`,
    PKG_VERSION: `'${packageJson.version}'`
  }
}
