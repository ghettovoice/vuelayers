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
const sass = require('./rollup-plugins/sass')
const externalize = require('./rollup-plugins/externalize')
const notifier = require('node-notifier')
const argv = require('yargs').argv
const { escapeRegExp, camelCase } = require('lodash/fp')
const { dependencies, peerDependencies, devDependencies } = require('../package.json')
const utils = require('./utils')
const config = require('./config')

const bundles = argv.bundles
  ? argv.bundles.split(',').map(s => s.trim())
  : ['es', 'cjs', 'umd', 'umd.min']

bundles.reduce((prev, format) => prev.then(() => makeBundles(format)), Promise.resolve())

  // ES6
  // .then(() => bundles.includes('es') && bundle({
  //   outDir: config.outDir,
  //   format: 'es',
  //   bundleName: config.name + '.es',
  //   styleName: config.name,
  //   entry: config.entry,
  //   external: nodeExternal(),
  //   banner: config.banner,
  //   varName: config.fullname,
  // }))
  // // CommonJS
  // .then(() => bundles.includes('cjs') && bundle({
  //   outDir: config.outDir,
  //   format: 'cjs',
  //   bundleName: config.name + '.cjs',
  //   styleName: config.name,
  //   entry: config.cjsEntry,
  //   external: nodeExternal(),
  //   banner: config.banner,
  //   varName: config.fullname,
  // }))
  // // UMD
  // .then(() => bundles.includes('umd') && bundle({
  //   outDir: config.outDir,
  //   format: 'umd',
  //   bundleName: config.name + '.umd',
  //   styleName: config.name,
  //   entry: config.cjsEntry,
  //   env: 'development',
  //   external: ['vue', 'openlayers', 'ol'],
  //   globals: {
  //     vue: 'Vue',
  //     openlayers: 'ol',
  //   },
  //   banner: config.banner,
  //   varName: config.fullname,
  // }))
  // // UMD minified
  // .then(() => bundles.includes('umd-min') && bundle({
  //   outDir: config.outDir,
  //   format: 'umd',
  //   bundleName: config.name + '.umd.min',
  //   styleName: config.name,
  //   entry: config.cjsEntry,
  //   env: 'production',
  //   external: ['vue', 'openlayers', 'ol'],
  //   globals: {
  //     vue: 'Vue',
  //     openlayers: 'ol',
  //   },
  //   banner: config.banner,
  //   varName: config.fullname,
  // }))
  // // Separate CommonJS modules
  // .then(() => {
  //   return bundles.includes('comp') && Promise.all([
  //     getUtils(),
  //     getCommons(),
  //     getComponents(),
  //   ]).then(result => {
  //     let bundles = result.reduce((all, bundles) => all.concat(bundles), [])
  //     let bundlesMap = bundles.map(({ src, dest }) => ({ src, dest }))
  //
  //     return Promise.all(
  //       [
  //         bundle({
  //           outDir: config.outDir,
  //           format: 'cjs',
  //           bundleName: 'modules/index',
  //           styleName: 'modules/style',
  //           entry: config.cjsEntry,
  //           external: nodeExternal(),
  //           modules: true,
  //           bundlesMap,
  //           banner: config.banner,
  //           varName: config.fullname,
  //         }),
  //       ].concat(
  //         bundles.map(opts => bundle({
  //           outDir: config.outDir,
  //           format: 'cjs',
  //           entry: opts.entry,
  //           bundleName: opts.bundleName,
  //           styleName: opts.styleName,
  //           external: nodeExternal(),
  //           modules: true,
  //           bundlesMap,
  //           banner: config.banner,
  //           varName: config.fullname,
  //         }))
  //       )
  //     )
  //   })
  // })
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
  let externals, globals, min
  [format, min] = format.split('.')
  let mainEntry = format === 'es' ? config.entry : config.cjsEntry
  if (format === 'umd') {
    externals = ['vue', 'openlayers', 'ol']
    globals = {
      vue: 'Vue',
      openlayers: 'ol',
    }
  } else {
    externals = getExternals()
  }

  return getAllModules('.' + format)
    .then(modules => {
      return makeBundle({
        outDir: config.outDir,
        entry: mainEntry,
        format,
        env,
        bundleName: ['index', format, min].filter(x => x).join('.'),
        styleName: ['style', min].filter(x => x).join('.'),
        externals,
        globals,
        banner: config.banner,
        modules: format === 'umd' ? undefined : modules,
        varName: config.fullname,
        min: !!min,
      }).then(() => modules)
    })
    .then(modules => {
      return modules.reduce((prev, { entry, bundleName, styleName }) => {
        return prev.then(() => makeBundle({
          outDir: config.outDir,
          entry,
          format,
          env,
          bundleName: [bundleName, min].filter(x => x).join('.'),
          styleName: [styleName, min].filter(x => x).join('.'),
          externals,
          globals,
          banner: config.banner,
          modules: format === 'umd' ? modules.filter(m => m.core) : modules,
          varName: [config.fullname, camelCase(path.dirname(bundleName))].join('.'),
          min: !!min,
        }))
      }, Promise.resolve())
    })
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

  const srcDir = utils.resolve('src')

  const plugins = [
    ...(opts.modules && opts.modules.length ? [
      externalize({
        root: srcDir,
        newRoot: path.relative(path.dirname(utils.resolve('')), opts.outDir),
        map: opts.modules.map(({ entry, bundleName }) => ({
          from: path.relative(srcDir, path.dirname(entry)),
          to: path.dirname(bundleName),
        })),
      }),
    ] : []),
    replace({
      sourceMap: true,
      values: replaces(opts),
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
      css: (_, styles) => {
        vueStylesPromise = Promise.all(styles.map(({ id, $compiled: { code, map } }) => ({ id, code, map })))
      },
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
    nodeResolve({
      main: true,
      module: true,
      jsnext: true,
      browser: true,
      preferBuiltins: false,
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
  let destCss = cssBundleName ? path.join(opts.outDir, cssBundleName + '.css') : undefined
  const spinner = ora(chalk.bold.blue(`making ${bundleName} bundle...`)).start()

  return rollup.rollup({
    input: opts.entry,
    external: opts.externals,
    plugins,
  }).then(bundler => bundler.generate({
    format: opts.format,
    banner: opts.banner,
    name: opts.varName,
    // moduleId: config.name,
    sourcemap: true,
    sourcemapFile: dest,
    globals: opts.globals,
  })).then(js => {
    if (!destCss) return { js, css: undefined }
    // concat all extracted styles from Vue and Sass files
    return Promise.all([
      sassStylesPromise,
      vueStylesPromise,
    ]).then(([sassStyles, vueStyles]) => {
      const { code, map } = utils.concatFiles(
        (sassStyles || []).concat(vueStyles).map(({ id, code, map }) => ({
          code,
          map,
          sourcesRelativeTo: id,
        })),
        destCss,
        opts.banner,
      )
      // todo add css minification if opts.min = true
      return utils.postcssProcess({
        id: destCss,
        code,
        map,
      })
    }).then(css => ({ js, css }))
  }).then(({ js, css }) => Promise.all([
    utils.writeFile(dest, js.code),
    utils.writeFile(dest + '.map', js.map),
    // todo write package.json, move config to options
    utils.writeFile(path.join(path.dirname(dest), 'package.json'), JSON.stringify({
      name: [config.name, path.basename(path.dirname(dest))].join('-'),
      author: config.author,
      version: config.version,
      main: 'index.cjs.js',
      module: 'index.es.js',
      browser: 'index.umd.min.js',
      unpkg: 'index.umd.js',
    }, null, 2)),
    css && utils.writeFile(destCss, css.code),
    css && utils.writeFile(destCss + '.map', css.map),
  ])).then(([jsSrc, jsMap, cssSrc, cssMap]) => {
    spinner.succeed(chalk.green(`${bundleName} bundle is ready`))

    console.log(jsSrc.path, chalk.gray(jsSrc.size))
    console.log(jsMap.path, chalk.gray(jsMap.size))

    cssSrc && console.log(cssSrc.path, chalk.gray(cssSrc.size))
    cssMap && console.log(cssMap.path, chalk.gray(cssMap.size))
  }).catch(err => {
    spinner.fail(chalk.red(`${bundleName} bundle is failed to create`))
    throw err
  })
}

function getExternals () {
  const nodeModules = [config.name].concat(
    Object.keys(dependencies),
    Object.keys(peerDependencies),
    Object.keys(devDependencies),
  ).map(escapeRegExp)
  const regex = new RegExp(`^(${nodeModules.join('|')}.*$)`)

  // modules = modules.reduce((all, { entry }) => {
  //   const moduleDir = path.dirname(entry)
  //   const moduleParentDir = path.dirname(moduleDir)
  //   const moduleName = path.basename(moduleDir)
  //
  //   all.push(entry, moduleDir)
  //
  //   let dir
  //   if (/\/components\//.test(moduleDir)) {
  //     dir = moduleDir.replace('components/', '')
  //   } else {
  //     dir = path.join(moduleParentDir, 'components', moduleName)
  //   }
  //   all.push(dir, dir + '/index.js')
  //
  //   return all
  // }, [])

  return moduleId => regex.test(moduleId)
}

function replaces (opts = {}) {
  const obj = Object.assign({}, config.replaces, {
    '@import ~': '@import ',
    '@import "~': '@import "',
  })

  if (opts.env) {
    obj['process.env.NODE_ENV'] = `'${opts.env}'`
  }

  if (opts.format === 'cjs') {
    obj['lodash-es'] = 'lodash'
  }

  return obj
}
