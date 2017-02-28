const packageJson = require('../package.json')

module.exports = {
  NODE_ENV: '"production"',
  PKG_NAME: `"${packageJson.name}"`,
  PKG_FULLNAME: `"${packageJson.fullname}"`,
  PKG_VERSION: `"${packageJson.version}"`
}
