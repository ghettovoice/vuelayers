const path = require('path')
const replace = require('rollup-plugin-replace')
const babel = require('rollup-plugin-babel')
const config = require('./config')

module.exports = {
  format: 'es',
  entry: path.join(__dirname, '../src/index.js'),
  dest: path.join(__dirname, '../dist/bundle.es.js'),
  banner: config.banner,
  plugins: [
    replace({
      'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
      PKG_VERSION: `'${config.version}'`
    }),
    babel()
  ],
  external (id) {
    return /^(openlayers|ol.*)$/i.test(id)
  },
  sourceMap: true
}
