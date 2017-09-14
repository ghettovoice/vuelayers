const fs = require('fs-extra')
const path = require('path')
const hljs = require('highlight.js')
const { escape } = require('lodash')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const StringReplacePlugin = require('string-replace-webpack-plugin')
const postcss = require('postcss')
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
  const resolveUrlLoader = {
    loader: 'resolve-url-loader',
    options: {
      sourceMap: options.sourceMap,
    },
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    const loaders = [cssLoader, resolveUrlLoader]
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
        resolve(''),
        resolve('node_modules'),
      ],
      indentedSyntax: true,
    }),
    scss: generateLoaders('sass', {
      includePaths: [
        resolve(''),
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

function postcssPlugins () {
  return [
    require('autoprefixer')({
      browsers: ['last 5 versions'],
    }),
  ]
}

function postcssProcess ({ id, code, map }) {
  return postcss(postcssPlugins())
    .process(code, {
      from: id,
      to: id,
      map: {
        inline: false,
        prev: map,
      },
    })
    .then(({ css, map }) => ({
      id,
      code: css,
      map: map.toString(),
    }))
}

function vueLoaderConfig (extract) {
  return {
    loaders: Object.assign(
      {},
      cssLoaders({
        sourceMap: true,
        extract,
      })
    ),
    postcss: postcssPlugins(),
  }
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

function vueMarkdownLoaderConfig () {
  return {
    langPrefix: '',
    preventExtract: true,
    wrapper: 'div',
    linkify: true,
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return '<pre class="hljs"><code class="' + lang + '">' +
            hljs.highlight(lang, str, true).value +
            '</code></pre>'
        } catch (__) {}
      }

      return '<pre class="hljs"><code class="' + lang + '">' + escape(str) + '</code></pre>'
    },
    preprocess: function (md, src) {
      const { pattern, replacement } = compileVarsReplacement()

      return src.replace(pattern, replacement)
    },
    use: [
      require('markdown-it-checkbox'),
      require('markdown-it-decorate'),
      [require('markdown-it-container'), 'content'],
    ],
  }
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

module.exports = {
  resolve,
  assetsPath,
  cssLoaders,
  styleLoaders,
  vueLoaderConfig,
  postcssPlugins,
  postcssProcess,
  writeFile,
  getSize,
  vueMarkdownLoaderConfig,
  compileVarsReplacement,
  compileVarsReplaceLoader,
}
