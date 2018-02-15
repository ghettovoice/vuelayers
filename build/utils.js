const fs = require('fs-extra')
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const StringReplacePlugin = require('string-replace-webpack-plugin')
const concat = require('source-map-concat')
const postcss = require('postcss')
const postcssrc = require('postcss-load-config')
const cssnano = require('cssnano')
const config = require('./config')

function resolve (relPath = '') {
  return path.join(__dirname, '..', relPath)
}

function cssLoaders (options) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap,
    },
  }
  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap,
    },
  }
  const resolveUrlLoader = {
    loader: 'resolve-url-loader',
    options: {
      sourceMap: options.sourceMap,
    },
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    const loaders = [cssLoader, postcssLoader, resolveUrlLoader]
    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap,
        }),
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader',
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // http://vuejs.github.io/vue-loader/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', {
      includePaths: [
        resolve(),
        resolve('node_modules'),
      ],
      indentedSyntax: true,
    }),
    scss: generateLoaders('sass', {
      includePaths: [
        resolve(),
        resolve('node_modules'),
      ],
    }),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus'),
  }
}

// Generate loaders for standalone style files (outside of .vue)
function styleLoaders (options) {
  const output = []
  const loaders = cssLoaders(options)
  for (let extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader,
    })
  }
  return output
}

function postcssProcess ({ id, code, map, min }) {
  return postcssrc()
    .then(({plugins, postcssOptions}) => {
      if (min) {
        plugins.push(cssnano())
      }

      return postcss(plugins)
        .process(code, Object.assign({}, postcssOptions, {
          from: id,
          to: id,
          map: {
            inline: false,
            prev: map,
            annotation: true,
          },
        }))
        .then(({css, map}) => ({
          id,
          code: css,
          map: map.toString(),
        }))
    })
}

function vueLoaderConfig (extract) {
  return {
    loaders: cssLoaders({
      sourceMap: true,
      extract,
    }),
    cssSourceMap: true,
    transformToRequire: {
      video: ['src', 'poster'],
      source: 'src',
      img: 'src',
      image: 'xlink:href',
      'vl-style-icon': 'src',
    },
  }
}

function writeFile (dest, data) {
  return fs.outputFile(dest, data)
    .then(() => ({
      path: dest,
      size: getSize(data),
    }))
}

function readDir (dir) {
  return fs.readdir(dir)
    .then(files => {
      return Promise.all(files.map(file => {
        const filePath = path.join(dir, file)

        return fs.stat(filePath)
          .then(stat => ({
            path: filePath,
            stat,
          }))
      }))
    })
}

function getSize (data) {
  const bytes = data.length || 0

  return bytes < 10000
    ? bytes.toFixed(0) + ' B'
    : bytes < 1024000
      ? (bytes / 1024).toPrecision(3) + ' kB'
      : (bytes / 1024 / 1024).toPrecision(4) + ' MB'
}

function compileVarsReplacement () {
  return {
    pattern: new RegExp(Object.keys(config.replaces).join('|'), 'g'),
    replacement: match => config.replaces[match],
  }
}

function compileVarsReplaceLoader () {
  return StringReplacePlugin.replace({
    replacements: [compileVarsReplacement()],
  })
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
    map: map.toString(),
  }
}

module.exports = {
  resolve,
  cssLoaders,
  styleLoaders,
  vueLoaderConfig,
  postcssProcess,
  writeFile,
  readDir,
  getSize,
  compileVarsReplacement,
  compileVarsReplaceLoader,
  concatFiles,
}
