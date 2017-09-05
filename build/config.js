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

const BASE_URL = process.env.BASE_URL || '/'

module.exports = {
  banner,
  name: packageJson.name,
  fullname: packageJson.fullname,
  author: packageJson.author,
  version: packageJson.version,
  license: packageJson.license,
  entry: path.join(__dirname, '../src/index.js'),
  cjsEntry: path.join(__dirname, '../src/index.cjs.js'),
  outDir: path.join(__dirname, '../dist'),
  publicPath: BASE_URL,
  assetsSubDir: 'static',
  host: 'localhost',
  port: 8081,
  replaces: {
    C_PKG_NAME: packageJson.name,
    C_PKG_FULLNAME: packageJson.fullname,
    C_PKG_DESCRIPTION: packageJson.description,
    C_PKG_KEYWORDS: packageJson.keywords.join(', '),
    C_PKG_VERSION: packageJson.version,
    C_PKG_HOMEPAGE: packageJson.homepage,
    C_PKG_AUTHOR: packageJson.author,
    C_BASE_URL: BASE_URL,
    C_AUTHOR_HOMEPAGE: 'https://ghettovoice.github.io/',
  },
  autoOpenBrowser: true,
}
