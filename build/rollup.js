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
const resolver = require('./rollup/resolver')
const notifier = require('node-notifier')
const argv = require('yargs').argv
const {escapeRegExp, camelCase, upperFirst, merge} = require('lodash')
const { dependencies, peerDependencies, devDependencies } = require('../package.json')
const utils = require('./utils')
const config = require('./config')

const formats = argv.format
  ? argv.format.split(',').map(s => s.trim())
  : ['es', 'cjs', 'umd']

const srcPath = utils.resolve('src')
const srcRegExp = new RegExp(escapeRegExp(srcPath))
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
  if (!/index$/i.test(jsName)) {
    jsName = path.join(jsName, 'index')
  }
  let pkgName = jsName.replace(/\/index$/i, '')

  return {
    entry: entryPath,
    jsName,
    pkgName,
  }
}

function bundleOptions (format, package, env = 'development') {
  let options = Object.assign({}, package, {
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
      // all ../** paths inside mixin/ol-ext/rx-ext/util -> ../../**
      {
        include: [
          'src/mixin/**/*',
          'src/ol-ext/**/*',
          'src/rx-ext/**/*',
          'src/util/**/*',
        ],
        test: /'(\.{2}\/)+([^']*)'/ig,
        replace: (m1, m2, m3) => `'../${m2}/${m3}'`,
      },
      // all ./** paths inside mixin/ol-ext/rx-ext/util -> ../**
      {
        include: [
          'src/mixin/**/*',
          'src/ol-ext/**/*',
          'src/rx-ext/**/*',
          'src/util/**/*',
        ],
        test: /'\.\/([^']*)'/ig,
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
      break
    case 'cjs':
      options.input.external = external
      options.patterns = patterns
      process.env.BABEL_ENV = 'es5-production'
      break
    case 'es':
      options.input.external = external
      options.jsName += '.' + format
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

  const jsOutputPath = path.join(config.outputPath, options.jsName) + '.js'
  const cssOutputPath = options.cssName
    ? path.join(config.outputPath, options.cssName) + '.css'
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
  }).then(bundles => {
    // write package.json in pkgName provided
    if (options.pkgName) {
      return writePackageJSON(options).then(() => bundles)
    }
    return bundles
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

function writePackageJSON (options) {
  let name = ['@' + config.name, options.pkgName].join('/')
  let indexFile = path.basename(options.jsName, '.' + options.format)
  let pkgPath = path.dirname(path.join(config.outputPath, options.jsName))

  return utils.writeFile(
    path.join(pkgPath, 'package.json'),
    JSON.stringify({
      name,
      description: `Part of the ${config.fullname} package`,
      author: config.author,
      version: config.version,
      license: config.license,
      main: `${indexFile}.js`,
      module: `${indexFile}.es.js`,
    }, null, 2),
  )
}

// function makeBundles (format, env = 'development') {
//   let min
//   [format, min] = format.split('-')
//   let mainEntry = config.entry
//
//   const externals = (format, modules = []) => {
//     let deps = []
//     if (format === 'umd') {
//       deps = ['vue', 'openlayers']
//     }
//
//     return getExternals(modules, deps)
//   }
//   const globals = (format, modules = []) => {
//     if (format === 'umd') {
//       return Object.assign({
//         vue: 'Vue',
//         openlayers: 'ol',
//       }, modules.reduce((all, { entry }) => {
//         let moduleName = path.basename(path.dirname(entry))
//
//         return Object.assign(
//           all,
//           getModuleEntryVariants(entry).reduce((obj, moduleId) => Object.assign(obj, {
//             [moduleId]: getVarName(moduleName),
//           })),
//         )
//       }, {}))
//     }
//   }
//
//   let bundleSuffix = format === 'cjs' ? '' : '.' + format
//
//   return getAllModules(bundleSuffix, format === 'umd' ? '.' + format : '')
//     .then(modules => {
//       return makeBundle({
//         outDir: config.outDir,
//         entry: mainEntry,
//         format,
//         env,
//         bundleName: ['index', format === 'cjs' ? '' : format, min].filter(x => x).join('.'),
//         styleName: ['style', min].filter(x => x).join('.'),
//         replaces: replaces({
//           paths: format !== 'umd',
//           env,
//         }),
//         externals: externals(format, format !== 'umd' ? modules : []),
//         globals: globals(format),
//         banner: config.banner,
//         modules: format === 'umd' ? undefined : modules,
//         varName: config.fullname,
//         min: !!min,
//       }).then(() => modules)
//     })
//     .then(modules => {
//       return modules.reduce((prev, { entry, bundleName, styleName }) => {
//         const otherModules = modules.filter(m => m.bundleName !== bundleName)
//
//         return prev.then(() => makeBundle({
//           outDir: config.outDir,
//           entry,
//           format,
//           env,
//           bundleName: [bundleName, min].filter(x => x).join('.'),
//           // styleName: [styleName, min].filter(x => x).join('.'),
//           replaces: replaces({
//             paths: true,
//             env,
//           }),
//           externals: externals(format, otherModules),
//           globals: globals(format, otherModules),
//           banner: config.banner,
//           modules: otherModules,
//           varName: getVarName(path.dirname(bundleName)),
//           min: !!min,
//           pkg: true,
//         }))
//       }, Promise.resolve())
//     })
// }
//
// function getVarName (bundleName, fullname = true) {
//   let fieldName = camelCase(bundleName)
//   if (bundleName !== 'core') {
//     fieldName = upperFirst(fieldName)
//   }
//
//   return [
//     fullname ? config.fullname : '',
//     fieldName,
//   ].filter(x => x).join('.')
// }
//
// function makeBundle (opts = {}) {
//   let bundleName = opts.bundleName
//   let cssBundleName = opts.styleName === true
//     ? bundleName
//     : (typeof opts.styleName === 'string'
//       ? opts.styleName
//       : undefined)
//   let vueStylesPromise = Promise.resolve()
//   let sassStylesPromise = Promise.resolve()
//
//   if (['cjs', 'umd'].includes(opts.format)) {
//     process.env.BABEL_ENV = 'production-cjs'
//   } else {
//     process.env.BABEL_ENV = 'production'
//   }
//
//   // const srcDir = util.resolve('src')
//
//   const plugins = [
//     // ...(opts.modules && opts.modules.length ? [
//     //   externalize({
//     //     root: srcDir,
//     //     newRoot: path.relative(path.dirname(util.resolve('')), opts.outDir),
//     //     map: opts.modules.map(({ entry, bundleName }) => ({
//     //       from: path.relative(srcDir, path.dirname(entry)),
//     //       to: path.dirname(bundleName),
//     //     })),
//     //   }),
//     // ] : []),
//     replace({
//       delimiters: ['', ''],
//       sourceMap: true,
//       values: opts.replaces,
//     }),
//     vue({
//       compileTemplate: true,
//       htmlMinifier: { collapseBooleanAttributes: false },
//       sourceMap: true,
//       scss: {
//         sourceMapContents: true,
//         includePaths: [
//           utils.resolve('node_modules'),
//         ],
//       },
//       css: false,
//       // css: (_, styles) => {
//       //   vueStylesPromise = Promise.all(styles.map(({ id, $compiled: { code, map } }) => ({ id, code, map })))
//       // },
//     }),
//     sass({
//       banner: opts.banner,
//       sass: {
//         includePaths: [
//           utils.resolve('node_modules'),
//         ],
//       },
//       output: styles => {
//         sassStylesPromise = Promise.all(styles)
//       },
//     }),
//     babel({
//       runtimeHelpers: true,
//       sourceMap: true,
//       include: [
//         'src/**/*',
//         'node_modules/ol-tilecache/**/*',
//       ],
//     }),
//     resolver({
//       modules: opts.modules,
//     }),
//     nodeResolve({
//       main: true,
//       module: true,
//       jsnext: true,
//       browser: true,
//     }),
//     cjs(),
//   ]
//
//   if (opts.min) {
//     plugins.push(
//       uglify({
//         mangle: true,
//         sourceMap: true,
//         compress: {
//           warnings: false,
//         },
//         output: {
//           comments: (node, comment) => {
//             let text = comment.value
//             let type = comment.type
//             if (type === 'comment2') {
//               // multiline comment
//               return /@preserve|@license|@cc_on/i.test(text)
//             }
//           },
//         },
//       }),
//     )
//   }
//
//   const dest = path.join(opts.outDir, `${bundleName}.js`)
//   const scDest = dest + '.map'
//   let destCss = cssBundleName ? path.join(opts.outDir, cssBundleName + '.css') : undefined
//   const spinner = ora(chalk.bold.blue(`making ${bundleName} bundle...`)).start()
//
//   return rollup.rollup({
//     input: opts.entry,
//     external: opts.externals,
//     plugins,
//   }).then(bundler => bundler.generate({
//     format: opts.format,
//     intro: opts.intro,
//     outro: opts.outro,
//     banner: opts.banner,
//     footer: opts.footer || `\n//# sourceMappingURL=${path.basename(scDest)}`,
//     name: opts.varName,
//     // moduleId: config.name,
//     sourcemap: true,
//     sourcemapFile: dest,
//     globals: opts.globals,
//     paths: opts.paths,
//     amd: opts.amd,
//   })).then(js => {
//     if (!destCss) return { js, css: undefined }
//     // concat all extracted styles from Vue and Sass files
//     return Promise.all([
//       sassStylesPromise,
//       vueStylesPromise,
//     ]).then(([sassStyles, vueStyles]) => {
//       const files = (sassStyles || []).concat(vueStyles || [])
//         .reduce((all, { id, code, map }) => {
//           if (code) {
//             all.push({
//               code,
//               map,
//               sourcesRelativeTo: id,
//             })
//           }
//
//           return all
//         }, [])
//
//       const { code, map } = utils.concatFiles(files, destCss, opts.banner)
//
//       return utils.postcssProcess({
//         id: destCss,
//         code,
//         map,
//         min: opts.min,
//       })
//     }).then(css => ({ js, css }))
//   }).then(({ js, css }) => {
//     return Promise.all([
//       utils.writeFile(dest, js.code),
//       utils.writeFile(scDest, js.map.toString()),
//       opts.pkg && writePackageJSON(dest),
//       css && utils.writeFile(destCss, css.code),
//       css && utils.writeFile(destCss + '.map', css.map),
//     ])
//   }).then(([jsSrc, jsMap, pkgJson, cssSrc, cssMap]) => {
//     spinner.succeed(chalk.green(`${bundleName} bundle is ready`))
//
//     console.log(jsSrc.path, chalk.gray(jsSrc.size))
//     console.log(jsMap.path, chalk.gray(jsMap.size))
//
//     pkgJson && console.log(pkgJson.path, chalk.gray(pkgJson.size))
//
//     cssSrc && console.log(cssSrc.path, chalk.gray(cssSrc.size))
//     cssMap && console.log(cssMap.path, chalk.gray(cssMap.size))
//   }).catch(err => {
//     spinner.fail(chalk.red(`${bundleName} bundle is failed to create`))
//     throw err
//   })
// }
//
//
// function getExternals (nodeModules = []) {
//   nodeModules = nodeModules.length ? nodeModules : [config.name].concat(
//     Object.keys(dependencies),
//     Object.keys(peerDependencies),
//     Object.keys(devDependencies),
//   ).map(escapeRegExp)
//   const regex = new RegExp(`^(${nodeModules.join('|')}.*$)`)
//
//   return (id, parent) => {
//     if (regex.test(id)) return true
//
//     // todo each folder inside components as package
//     // todo core folder as package
//   }
// }
//
// function replaces (opts = {}) {
//   let obj = Object.assign({}, config.replaces, {
//     '@import ~': '@import ',
//     '@import "~': '@import "',
//   })
//
//   if (opts.env) {
//     obj['process.env.NODE_ENV'] = `'${opts.env}'`
//   }
//
//   if (opts.paths) {
//     Object.assign(obj, {
//       './components/': './',
//       '../../core': '../core',
//     })
//   }
//
//   if (opts.style) {
//     obj['// C_STYLE_IMPORT'] = `import '${opts.style}'`
//   }
//
//   return obj
// }
//
// function getModuleEntryVariants (entry) {
//   const moduleDir = path.dirname(entry)
//   const moduleParentDir = path.dirname(moduleDir)
//   const moduleName = path.basename(moduleDir)
//
//   let dir
//   if (/\/components\//.test(moduleDir)) {
//     dir = moduleDir.replace('component/', '')
//   } else {
//     dir = path.join(moduleParentDir, 'components', moduleName)
//   }
//
//   return [
//     entry,
//     moduleDir,
//     dir,
//     dir + '/index.js',
//   ]
// }
