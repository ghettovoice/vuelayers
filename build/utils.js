const fs = require('fs-extra')
const path = require('path')
const concat = require('source-map-concat')
const postcss = require('postcss')
const postcssrc = require('postcss-load-config')
const cssnano = require('cssnano')

function resolve (...relPath) {
  return path.join(__dirname, '..', ...relPath)
}

function postcssProcess (css, min) {
  return postcssrc()
    .then(({ plugins, postcssOptions }) => {
      if (min) {
        plugins.push(cssnano())
      }
      const id = css.id
      return postcss(plugins)
        .process(css.code, Object.assign({}, postcssOptions, {
          from: css.id,
          to: css.dest,
          map: {
            inline: false,
            prev: css.map,
          },
        }))
        .then(({ css, map }) => ({
          id,
          code: css,
          map: map.toJSON(),
        }))
    })
}

function writeFile (dest, data) {
  return fs.outputFile(dest, data)
    .then(() => ({
      path: dest,
      size: getSize(data),
    }))
}

function getSize (data) {
  const bytes = data.length || 0

  return bytes < 10000
    ? bytes.toFixed(0) + ' B'
    : bytes < 1024000
      ? (bytes / 1024).toPrecision(3) + ' kB'
      : (bytes / 1024 / 1024).toPrecision(4) + ' MB'
}

function concatFiles (files, dest, banner) {
  const concatenated = concat(files, {
    delimiter: '\n',
    mapPath: dest + '.map',
  })

  if (banner) {
    concatenated.prepend(banner + '\n')
  }

  const { code, map } = concatenated.toStringWithSourceMap({
    file: path.basename(dest),
  })

  return {
    id: dest,
    code: code,
    map: map.toJSON(),
  }
}

module.exports = {
  resolve,
  postcssProcess,
  writeFile,
  getSize,
  concatFiles,
}
