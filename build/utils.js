const fs = require('fs-extra')
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const StringReplacePlugin = require('string-replace-webpack-plugin')
const config = require('./config')

function resolve (relPath) {
  return path.join(__dirname, '..', relPath)
}

function assetsPath (_path) {
  const assetsSubDirectory = config.assetsSubDir

  return path.posix.join(assetsSubDirectory, _path)
}

function cssLoaders (options) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap,
    },
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    const loaders = [cssLoader]
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
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
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

function postcssPlugins () {
  return [
    require('autoprefixer')({
      browsers: ['last 5 versions'],
    }),
  ]
}

function vueLoaderConfig (extract) {
  return {
    preLoaders: {
      html: stringReplaceLoader(),
      // js: compileVarsReplaceLoader(),
      // html: require.resolve('./loaders/string-replace') + '?' + JSON.stringify({ replaces: config.replaces }),
    },
    loaders: {
      ...cssLoaders({
        sourceMap: true,
        extract,
      }),
    },
    postcss: postcssPlugins(),
  }
}

function writeFile (dest, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(dest, data, function (err) {
      if (err) return reject(err)

      resolve({
        path: dest,
        size: getSize(data),
      })
    })
  })
}

function ensureDir (dir) {
  return new Promise((resolve, reject) => {
    fs.ensureDir(dir, err => {
      if (err) return reject(err)

      resolve()
    })
  })
}

function getSize (data) {
  return (data.length / 1024).toFixed(2) + 'kb'
}

function vueMarkdownLoaderConfig () {
  return {
    preprocess: (md, src) => `<div class="content">\n\n${src}\n\n</div>`,
    use: [
      require('markdown-it-checkbox'),
      require('markdown-it-decorate'),
    ],
  }
}

function stringReplaceLoader () {
  return StringReplacePlugin.replace({
    replacements: Object.keys(config.replaces).map(token => ({
      pattern: new RegExp(token, 'g'),
      replacement: match => config.replaces[match],
    })),
  })
}

module.exports = {
  resolve,
  assetsPath,
  cssLoaders,
  styleLoaders,
  vueLoaderConfig,
  postcssPlugins,
  writeFile,
  ensureDir,
  getSize,
  vueMarkdownLoaderConfig,
  stringReplaceLoader,
}
