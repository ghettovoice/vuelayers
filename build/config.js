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
  cjsEntry: path.join(__dirname, '../src/index.cjs.js'),
  outDir: path.join(__dirname, '../dist'),
  publicPath: '/',
  assetsSubDir: 'static',
  host: 'localhost',
  port: 8081,
  replaces: {
    PKG_NAME: `'${packageJson.name}'`,
    PKG_FULLNAME: `'${packageJson.fullname}'`,
    PKG_DESCRIPTION: `'${packageJson.description}'`,
    PKG_KEYWORDS: JSON.stringify(packageJson.keywords),
    PKG_VERSION: `'${packageJson.version}'`,
    PKG_GITHUB_URL: `'https://github.com/ghettovoice/vuelayers'`,
    PKG_AUTHOR: "'Vladimir Vershinin'",
    PKG_BADGES: JSON.stringify([
      {
        title: 'Build Status',
        url: 'https://travis-ci.org/ghettovoice/vuelayers',
        src: 'https://travis-ci.org/ghettovoice/vuelayers.svg?branch=master'
      },
      {
        title: 'Coverage Status',
        url: 'https://coveralls.io/github/ghettovoice/vuelayers?branch=master',
        src: 'https://coveralls.io/repos/github/ghettovoice/vuelayers/badge.svg?branch=master'
      },
      {
        title: 'JS Standard style',
        url: 'http://standardjs.com',
        src: 'https://img.shields.io/badge/code%20style-standard-brightgreen.svg'
      },
      {
        title: 'GitHub tag',
        url: 'https://github.com/ghettovoice/vuelayers/releases',
        src: 'https://img.shields.io/github/tag/ghettovoice/vuelayers.svg'
      },
      {
        title: 'NPM version',
        url: 'https://www.npmjs.com/package/vuelayers',
        src: 'https://img.shields.io/npm/v/vuelayers.svg'
      },
      {
        title: 'License MIT',
        url: 'https://github.com/ghettovoice/vuelayers/blob/master/LICENSE',
        src: 'https://img.shields.io/github/license/ghettovoice/vuelayers.svg'
      },
      {
        title: 'Dependencies',
        url: 'https://david-dm.org/ghettovoice/vuelayers',
        src: 'https://img.shields.io/david/ghettovoice/vuelayers.svg'
      },
      {
        title: 'Dev dependencies',
        url: 'https://david-dm.org/ghettovoice/vuelayers?type=dev',
        src: 'https://img.shields.io/david/dev/ghettovoice/vuelayers.svg'
      }
    ]),
    BASE_URL: "'/'",
    MY_HOMEPAGE: "'https://ghettovoice.github.io'"
  },
  autoOpenBrowser: true
}
