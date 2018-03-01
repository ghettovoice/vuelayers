const path = require('path')
const chalk = require('chalk')
const ora = require('ora')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const cjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')
const replace = require('rollup-plugin-re')
const vue = require('rollup-plugin-vue')
const uglify = require('rollup-plugin-uglify')
const sass = require('./rollup/sass')
const notifier = require('node-notifier')
const argv = require('yargs').argv
const utils = require('./utils')
const config = require('./config')

const formats = argv.format
  ? argv.format.split(',').map(s => s.trim())
  : ['es', 'cjs', 'umd']

const srcPath = utils.resolve('src')
// form list of all packages to bundle
getAllPackages()
  .then(packages => {
    // traverse all provided formats
    return formats.reduce((prev, format) => {
      return prev.then(() => {
        if (format === 'umd') {
          packages = packages.slice(0, 1)
        }
        // bundle each package in provided format
        return packages.reduce((prev, package) => {
          return prev.then(() => makeBundle(bundleOptions(format, package)))
            .then(() => {
              // append uglified UMD bundle
              if (format === 'umd') {
                return makeBundle(bundleOptions(format, package, 'production'))
              }
            })
        }, Promise.resolve())
      })
    }, Promise.resolve())
  })
  .then(() => {
    notifier.notify({
      title: config.fullname,
      message: 'All done!',
    })
  })
  .catch(err => {
    console.log(chalk.red(err.stack))
    process.exit(1)
  })

/********************************************************/
/* HELPERS                                              */
/********************************************************/
function getAllPackages () {
  const packages = [
    // main package
    {
      entry: config.entry,
      jsName: 'index',
      cssName: 'style',
      globName: config.fullname,
      amdName: config.name,
    },
    // core package
    {
      entry: utils.resolve('src/core/index.js'),
      jsName: 'core/index',
      pkgName: 'core',
    },
  ]

  return Promise.all([
    packagesFromPath(utils.resolve('src/component'), utils.resolve('src/component')),
    packagesFromPath(utils.resolve('src/mixin'), srcPath),
    packagesFromPath(utils.resolve('src/ol-ext'), srcPath),
    packagesFromPath(utils.resolve('src/rx-ext'), srcPath),
    packagesFromPath(utils.resolve('src/util'), srcPath),
  ]).then(otherPackages => {
    return packages.concat(otherPackages.reduce((all, packages) => all.concat(packages), []))
  })
}

function packagesFromPath (searchPath, basePath = srcPath) {
  return utils.readDir(searchPath)
    .then(entries => entries.reduce((packages, entry) => {
      return packages.concat(entryToPackage(entry, basePath))
    }, []))
}

function entryToPackage (entry, basePath = srcPath) {
  let entryPath = entry.path
  if (!/\.js$/i.test(entryPath)) {
    entryPath = path.join(entry.path, 'index.js')
  }
  let jsName = path.relative(basePath, entryPath.replace(/\.js$/i, ''))
  let pkgName = jsName.replace(/\/index$/i, '')

  return {
    entry: entryPath,
    jsName,
    pkgName,
  }
}

function bundleOptions (format, package, env = 'development') {
  let options = Object.assign({}, package, {
    outputPath: config.outputPath,
    input: {
      input: package.entry,
    },
    output: {
      format,
      banner: config.banner,
      name: package.globName,
      amd: package.amdName ? {
        id: package.amdName,
      } : undefined,
    },
    format,
    env,
    // used before commonjs resolve
    replaces: Object.assign({
      '@import ~': '@import ',
      '@import "~': '@import "',
    }, config.replaces),
    defines: {
      IS_STANDALONE: false,
    },
  })

  // es/cjs external resolver
  const external = (id, parentId) => {
    if (!parentId) {
      return false
    }
    if (/\.(sass|vue)$/i.test(id)) {
      return false
    }
    // check internal core imports
    const coreRegExp = /core\/.*/i
    if (
      coreRegExp.test(parentId) && (
        id.slice(0, 2) === './' ||
        coreRegExp.test(id)
      )
    ) {
      return false
    }
    // check internal component imports
    const componentsRegExp = /component\/.*/i
    return !(
      componentsRegExp.test(parentId) && (
        id.slice(0, 2) === './' ||
        componentsRegExp.test(id) &&
        path.basename(path.dirname(id)) === path.basename(path.dirname(parentId))
      )
    )
  }
  // es/cjs path replacements in 2 phases
  const patterns = [
    [
      // core sub-path -> core replacement
      {
        exclude: [
          'src/core/**/*',
        ],
        test: /'((?:\.{1,2}\/)+core)\/[^']*'/ig,
        replace: (m1, m2) => `'${m2}'`,
      },
    ],
    [
      // component/**/* -> **/* replacement
      {
        test: /'(\.{1,2})\/component\/([^']*)'/ig,
        replace: (m1, m2, m3) => `'${m2}/${m3}'`,
      },
      // mixin/util/ol-ext/rx-ext path inside component replacement
      {
        include: [
          'src/component/**/*',
        ],
        test: /'(?:\.{2}\/){2}((?:mixin|ol-ext|rx-ext|util)\/[^']*)'/ig,
        replace: (m1, m2) => `'../${m2}'`,
      },
    ],
  ]

  switch (format) {
    case 'umd':
      options.jsName += '.' + format
      options.output.globals = {
        vue: 'Vue',
        openlayers: 'ol',
      }
      options.input.external = ['vue', 'openlayers']
      options.replaces['process.env.NODE_ENV'] = `'${env}'`
      process.env.BABEL_ENV = 'es5-production'
      options.defines.IS_STANDALONE = true
      break
    case 'cjs':
      options.input.external = external
      options.patterns = patterns
      process.env.BABEL_ENV = 'es5-production'
      break
    case 'es':
      options.outputPath = path.join(options.outputPath, '_esm2015')
      options.input.external = external
      options.cssName = undefined
      options.patterns = patterns
      break
  }

  return options
}

function makeBundle (options = {}) {
  let stylesPromise = Promise.resolve([])

  const plugins = [
    // compile-time variables replace
    replace({
      sourceMap: true,
      include: [
        'src/**/*',
      ],
      replaces: options.replaces,
      defines: options.defines,
    }),
    vue({
      compileTemplate: true,
      htmlMinifier: { collapseBooleanAttributes: false },
      sourceMap: true,
      scss: {
        sourceMapContents: true,
        includePaths: [
          utils.resolve('node_modules'),
        ],
      },
      css: false,
    }),
    sass({
      sass: {
        indentedSyntax: true,
        includePaths: [
          utils.resolve('src'),
          utils.resolve('src/sass'),
          utils.resolve('node_modules'),
        ],
      },
      output: styles => {
        stylesPromise = Promise.resolve(styles || [])
      },
    }),
    babel({
      runtimeHelpers: true,
      sourceMap: true,
      include: [
        'src/**/*',
        'node_modules/ol-tilecache/**/*',
        'node_modules/rxjs/_esm2015/**/*',
      ],
    }),
    nodeResolve({
      main: true,
      module: true,
      jsnext: true,
      browser: true,
    }),
    cjs(),
    // paths replace
    ...(
      options.patterns
        ? options.patterns.map(patterns => replace({
          include: [
            'src/**/*',
          ],
          sourceMap: true,
          patterns,
        }))
        : []
    ),
  ]

  if (options.env === 'production') {
    options.jsName += '.min'
    if (options.cssName) {
      options.cssName += '.min'
    }

    plugins.push(
      uglify({
        mangle: true,
        sourceMap: true,
        compress: {
          warnings: false,
        },
        output: {
          comments: (node, comment) => {
            let text = comment.value
            let type = comment.type
            if (type === 'comment2') {
              // multiline comment
              return /@preserve|@license|@cc_on/i.test(text)
            }
          },
        },
      })
    )
  }

  const jsOutputPath = path.join(options.outputPath, options.jsName) + '.js'
  const cssOutputPath = options.cssName
    ? path.join(options.outputPath, options.cssName) + '.css'
    : undefined

  const spinner = ora(chalk.bold.blue(`making ${options.format} ${options.jsName} bundle...`)).start()

  // prepare rollup bundler
  return rollup.rollup(Object.assign({}, options.input, {
    plugins,
  })).then(bundle => {
    // generate bundle
    return bundle.generate(Object.assign({}, options.output, {
      sourcemap: true,
      sourcemapFile: jsOutputPath,
    }))
  }).then(js => {
    // concatenate all styles from Sass and Vue files
    if (!cssOutputPath) {
      return {js, css: undefined}
    }

    return stylesPromise.then(styles => {
      const files = styles.reduce((all, css) => {
        if (!css.code) return all

        return all.concat(Object.assign(css, {
          sourcesRelativeTo: css.id,
        }))
      }, [])

      const css = utils.concatFiles(files, cssOutputPath, options.output.banner)

      return utils.postcssProcess(css, options.env === 'production')
    }).then(css => ({ js, css }))
  }).then(({ js, css }) => {
    // write js / css bundles to output path
    return Promise.all([
      utils.writeFile(jsOutputPath, js.code),
      utils.writeFile(jsOutputPath + '.map', JSON.stringify(js.map)),
      css && utils.writeFile(cssOutputPath, css.code),
      css && utils.writeFile(cssOutputPath + '.map', JSON.stringify(css.map)),
    ])
  }).then(([jsSrc, jsMap, cssSrc, cssMap]) => {
    // output results
    spinner.succeed(chalk.green(`bundle ${options.format} ${options.jsName} was created successfully`))

    console.log(jsSrc.path, chalk.gray(jsSrc.size))
    console.log(jsMap.path, chalk.gray(jsMap.size))
    cssSrc && console.log(cssSrc.path, chalk.gray(cssSrc.size))
    cssMap && console.log(cssMap.path, chalk.gray(cssMap.size))
  }).catch(err => {
    spinner.fail(chalk.red(`bundle ${options.jsName} could not be created`))
    throw err
  })
}
