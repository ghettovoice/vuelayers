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
const primaryColor = '#1e88e5'

module.exports = {
  banner,
  name: packageJson.name,
  fullname: packageJson.fullname,
  author: packageJson.author,
  version: packageJson.version,
  license: packageJson.license,
  entry: path.join(__dirname, '../src/index.js'),
  cjsEntry: path.join(__dirname, '../src/index.js'),
  outDir: path.join(__dirname, '../lib'),
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
    C_PKG_REPOSITORY: packageJson.homepage,
    C_PKG_AUTHOR_HOMEPAGE: 'https://ghettovoice.github.io/',
    C_PKG_AUTHOR_NAME: 'Vladimir Vershinin',
    C_PKG_AUTHOR_USER: 'ghettovoice',
    C_PKG_LICENSE_URL: 'https://github.com/ghettovoice/vuelayers/blob/master/LICENSE',
    C_PKG_LICENSE_NAME: packageJson.license,
    C_BASE_URL: BASE_URL,
    C_GOOGLE_UID: 'UA-98870917-3',
    C_PRIMARY_COLOR: primaryColor,
  },
  autoOpenBrowser: true,
  themeColor: primaryColor,
}
