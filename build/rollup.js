const path = require('path')
const chalk = require('chalk')
const ora = require('ora')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const cjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')
const replace = require('rollup-plugin-replace')
const vue = require('rollup-plugin-vue')
const uglify = require('rollup-plugin-uglify')
const sass = require('./rollup/sass')
// const externalize = require('./rollup-plugins/externalize')
const resolver = require('./rollup/resolver')
const notifier = require('node-notifier')
const argv = require('yargs').argv
const { escapeRegExp, camelCase, upperFirst } = require('lodash/fp')
const { dependencies, peerDependencies, devDependencies } = require('../package.json')
const utils = require('./utils')
const config = require('./config')

const bundles = argv.bundles
  ? argv.bundles.split(',').map(s => s.trim())
  : ['es', 'cjs', 'umd', 'umd-min']

const srcRegExp = new RegExp(escapeRegExp(utils.resolve('src')))

bundles.reduce((prev, format) => prev.then(() => makeBundles(format)), Promise.resolve())
  // All done
  .then(() => {
    notifier.notify({
      title: config.fullname,
      message: 'Excellent, all bundles are ready!',
    })
  })
  .catch(err => {
    console.error(chalk.red(err.stack))
    process.exit(1)
  })

// helpers
function getAllModules (bundleNameSuffix = '', styleNameSuffix = '') {
  const common = [
    {
      core: true,
      entry: utils.resolve('src/core/index.js'),
      bundleName: 'core/index' + bundleNameSuffix,
      styleName: 'core/style' + styleNameSuffix,
    },
  ]

  return Promise.all([
    getComponents(bundleNameSuffix, styleNameSuffix),
  ]).then(([components]) => {
    return common.concat(components)
  })
}

function getComponents (bundleNameSuffix = '', styleNameSuffix = '') {
  const root = utils.resolve('src/components')

  return utils.readDir(root)
    .then(files => files.filter(({ stat }) => stat.isDirectory()))
    .then(dirs => dirs.map(dir => {
      return {
        entry: path.join(dir.path, 'index.js'),
        bundleName: path.relative(root, path.join(dir.path, 'index')) + bundleNameSuffix,
        styleName: path.relative(root, path.join(dir.path, 'style')) + styleNameSuffix,
      }
    }))
}

function makeBundles (format, env = 'development') {
  let min
  [format, min] = format.split('-')
  let mainEntry = format === 'es' ? config.entry : config.cjsEntry

  const externals = (format, modules = []) => {
    let deps = []
    if (format === 'umd') {
      deps = ['vue', 'openlayers']
    }

    return getExternals(modules, deps)
  }
  const globals = (format, modules = []) => {
    if (format === 'umd') {
      return Object.assign({
        vue: 'Vue',
        openlayers: 'ol',
      }, modules.reduce((all, { entry }) => {
        let moduleName = path.basename(path.dirname(entry))

        return Object.assign(
          all,
          getModuleEntryVariants(entry).reduce((obj, moduleId) => Object.assign(obj, {
            [moduleId]: getVarName(moduleName),
          })),
        )
      }, {}))
    }
  }

  let bundleSuffix = format === 'cjs' ? '' : '.' + format

  return getAllModules(bundleSuffix, format === 'umd' ? '.' + format : '')
    .then(modules => {
      return makeBundle({
        outDir: config.outDir,
        entry: mainEntry,
        format,
        env,
        bundleName: ['index', format === 'cjs' ? '' : format, min].filter(x => x).join('.'),
        styleName: ['style', min].filter(x => x).join('.'),
        replaces: replaces({
          paths: format !== 'umd',
          env,
        }),
        externals: externals(format, format !== 'umd' ? modules : []),
        globals: globals(format),
        banner: config.banner,
        modules: format === 'umd' ? undefined : modules,
        varName: config.fullname,
        min: !!min,
      }).then(() => modules)
    })
    .then(modules => {
      return modules.reduce((prev, { entry, bundleName, styleName }) => {
        const otherModules = modules.filter(m => m.bundleName !== bundleName)

        return prev.then(() => makeBundle({
          outDir: config.outDir,
          entry,
          format,
          env,
          bundleName: [bundleName, min].filter(x => x).join('.'),
          // styleName: [styleName, min].filter(x => x).join('.'),
          replaces: replaces({
            paths: true,
            env,
          }),
          externals: externals(format, otherModules),
          globals: globals(format, otherModules),
          banner: config.banner,
          modules: otherModules,
          varName: getVarName(path.dirname(bundleName)),
          min: !!min,
          pkg: true,
        }))
      }, Promise.resolve())
    })
}

function getVarName (bundleName, fullname = true) {
  let fieldName = camelCase(bundleName)
  if (bundleName !== 'core') {
    fieldName = upperFirst(fieldName)
  }

  return [
    fullname ? config.fullname : '',
    fieldName,
  ].filter(x => x).join('.')
}

function makeBundle (opts = {}) {
  let bundleName = opts.bundleName
  let cssBundleName = opts.styleName === true
    ? bundleName
    : (typeof opts.styleName === 'string'
      ? opts.styleName
      : undefined)
  let vueStylesPromise = Promise.resolve()
  let sassStylesPromise = Promise.resolve()

  if (['cjs', 'umd'].includes(opts.format)) {
    process.env.BABEL_ENV = 'production-cjs'
  } else {
    process.env.BABEL_ENV = 'production'
  }

  // const srcDir = utils.resolve('src')

  const plugins = [
    // ...(opts.modules && opts.modules.length ? [
    //   externalize({
    //     root: srcDir,
    //     newRoot: path.relative(path.dirname(utils.resolve('')), opts.outDir),
    //     map: opts.modules.map(({ entry, bundleName }) => ({
    //       from: path.relative(srcDir, path.dirname(entry)),
    //       to: path.dirname(bundleName),
    //     })),
    //   }),
    // ] : []),
    replace({
      sourceMap: true,
      values: opts.replaces,
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
      // css: (_, styles) => {
      //   vueStylesPromise = Promise.all(styles.map(({ id, $compiled: { code, map } }) => ({ id, code, map })))
      // },
    }),
    sass({
      banner: opts.banner,
      sass: {
        includePaths: [
          utils.resolve('node_modules'),
        ],
      },
      output: styles => {
        sassStylesPromise = Promise.all(styles)
      },
    }),
    babel({
      runtimeHelpers: true,
      sourceMap: true,
      include: [
        'src/**/*',
        'node_modules/ol-tilecache/**/*',
      ],
    }),
    resolver({
      modules: opts.modules,
    }),
    nodeResolve({
      main: true,
      module: true,
      jsnext: true,
      browser: true,
    }),
    cjs(),
  ]

  if (opts.min) {
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
      }),
    )
  }

  const dest = path.join(opts.outDir, `${bundleName}.js`)
  const scDest = dest + '.map'
  let destCss = cssBundleName ? path.join(opts.outDir, cssBundleName + '.css') : undefined
  const spinner = ora(chalk.bold.blue(`making ${bundleName} bundle...`)).start()

  return rollup.rollup({
    input: opts.entry,
    external: opts.externals,
    plugins,
  }).then(bundler => bundler.generate({
    format: opts.format,
    intro: opts.intro,
    outro: opts.outro,
    banner: opts.banner,
    footer: opts.footer || `\n//# sourceMappingURL=${path.basename(scDest)}`,
    name: opts.varName,
    // moduleId: config.name,
    sourcemap: true,
    sourcemapFile: dest,
    globals: opts.globals,
    paths: opts.paths,
    amd: opts.amd,
  })).then(js => {
    if (!destCss) return { js, css: undefined }
    // concat all extracted styles from Vue and Sass files
    return Promise.all([
      sassStylesPromise,
      vueStylesPromise,
    ]).then(([sassStyles, vueStyles]) => {
      const files = (sassStyles || []).concat(vueStyles || [])
        .reduce((all, { id, code, map }) => {
          if (code) {
            all.push({
              code,
              map,
              sourcesRelativeTo: id,
            })
          }

          return all
        }, [])

      const { code, map } = utils.concatFiles(files, destCss, opts.banner)

      return utils.postcssProcess({
        id: destCss,
        code,
        map,
        min: opts.min,
      })
    }).then(css => ({ js, css }))
  }).then(({ js, css }) => {
    return Promise.all([
      utils.writeFile(dest, js.code),
      utils.writeFile(scDest, js.map.toString()),
      opts.pkg && writePackageJSON(dest),
      css && utils.writeFile(destCss, css.code),
      css && utils.writeFile(destCss + '.map', css.map),
    ])
  }).then(([jsSrc, jsMap, pkgJson, cssSrc, cssMap]) => {
    spinner.succeed(chalk.green(`${bundleName} bundle is ready`))

    console.log(jsSrc.path, chalk.gray(jsSrc.size))
    console.log(jsMap.path, chalk.gray(jsMap.size))

    pkgJson && console.log(pkgJson.path, chalk.gray(pkgJson.size))

    cssSrc && console.log(cssSrc.path, chalk.gray(cssSrc.size))
    cssMap && console.log(cssMap.path, chalk.gray(cssMap.size))
  }).catch(err => {
    spinner.fail(chalk.red(`${bundleName} bundle is failed to create`))
    throw err
  })
}

function writePackageJSON (pkgIndexPath) {
  let name = ['@' + config.name, path.basename(path.dirname(pkgIndexPath))].join('/')
  let fileName = path.basename(pkgIndexPath).split('.')[0]

  return utils.writeFile(
    path.join(path.dirname(pkgIndexPath), 'package.json'),
    JSON.stringify({
      name,
      description: `Part of the ${config.fullname} package`,
      author: config.author,
      version: config.version,
      main: `${fileName}.js`,
      module: `${fileName}.es.js`,
      browser: `${fileName}.umd.min.js`,
      unpkg: `${fileName}.umd.js`,
    }, null, 2),
  )
}

function getExternals (modules = [], deps = []) {
  const nodeModules = deps.length ? deps : [config.name].concat(
    Object.keys(dependencies),
    Object.keys(peerDependencies),
    Object.keys(devDependencies),
  ).map(escapeRegExp)
  const regex = new RegExp(`^(${nodeModules.join('|')}.*$)`)

  modules = modules.reduce((all, { entry }) => {
    return all.concat(getModuleEntryVariants(entry))
  }, [])

  return moduleId => srcRegExp.test(moduleId) ? modules.includes(moduleId) : regex.test(moduleId)
}

function replaces (opts = {}) {
  let obj = Object.assign({}, config.replaces, {
    '@import ~': '@import ',
    '@import "~': '@import "',
  })

  if (opts.env) {
    obj['process.env.NODE_ENV'] = `'${opts.env}'`
  }

  if (opts.paths) {
    Object.assign(obj, {
      './components/': './',
      '../../core': '../core',
    })
  }

  if (opts.style) {
    obj['// C_STYLE_IMPORT'] = `import '${opts.style}'`
  }

  return obj
}

function getModuleEntryVariants (entry) {
  const moduleDir = path.dirname(entry)
  const moduleParentDir = path.dirname(moduleDir)
  const moduleName = path.basename(moduleDir)

  let dir
  if (/\/components\//.test(moduleDir)) {
    dir = moduleDir.replace('components/', '')
  } else {
    dir = path.join(moduleParentDir, 'components', moduleName)
  }

  return [
    entry,
    moduleDir,
    dir,
    dir + '/index.js',
  ]
}
