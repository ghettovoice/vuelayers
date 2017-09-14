const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const ora = require('ora')
const glob = require('glob')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const cjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')
const replace = require('rollup-plugin-replace')
const vue = require('rollup-plugin-vue')
const uglify = require('rollup-plugin-uglify')
const externalize = require('./rollup-plugins/externalize')
const sass = require('./rollup-plugins/sass')
const notifier = require('node-notifier')
const argv = require('yargs').argv
const { dependencies, peerDependencies, devDependencies } = require('../package.json')
const utils = require('./utils')
const config = require('./config')

const bundles = argv.bundles
  ? argv.bundles.split(',').map(s => s.trim())
  : ['es', 'umd', 'umd-min', 'cjs', 'comp']

Promise.resolve(fs.ensureDir(config.outDir))
  // ES6
  .then(() => bundles.includes('es') && bundle({
    outDir: config.outDir,
    format: 'es',
    bundleName: config.name + '.es',
    styleName: config.name,
    entry: config.entry,
    external: nodeExternal(),
    banner: config.banner,
    varName: config.fullname,
  }))
  // CommonJS
  .then(() => bundles.includes('cjs') && bundle({
    outDir: config.outDir,
    format: 'cjs',
    bundleName: config.name + '.cjs',
    styleName: config.name,
    entry: config.cjsEntry,
    external: nodeExternal(),
    banner: config.banner,
    varName: config.fullname,
  }))
  // UMD
  .then(() => bundles.includes('umd') && bundle({
    outDir: config.outDir,
    format: 'umd',
    bundleName: config.name + '.umd',
    styleName: config.name,
    entry: config.cjsEntry,
    env: 'development',
    external: ['vue', 'openlayers', 'ol'],
    globals: {
      vue: 'Vue',
      openlayers: 'ol',
    },
    banner: config.banner,
    varName: config.fullname,
  }))
  // UMD minified
  .then(() => bundles.includes('umd-min') && bundle({
    outDir: config.outDir,
    format: 'umd',
    bundleName: config.name + '.umd.min',
    styleName: config.name,
    entry: config.cjsEntry,
    env: 'production',
    external: ['vue', 'openlayers', 'ol'],
    globals: {
      vue: 'Vue',
      openlayers: 'ol',
    },
    banner: config.banner,
    varName: config.fullname,
  }))
  // Separate CommonJS modules
  .then(() => {
    return bundles.includes('comp') && Promise.all([
      getUtils(),
      getCommons(),
      getComponents(),
    ]).then(result => {
      let bundles = result.reduce((all, bundles) => all.concat(bundles), [])
      let bundlesMap = bundles.map(({ src, dest }) => ({ src, dest }))

      return Promise.all(
        [
          bundle({
            outDir: config.outDir,
            format: 'cjs',
            bundleName: 'modules/index',
            styleName: 'modules/style',
            entry: config.cjsEntry,
            external: nodeExternal(),
            modules: true,
            bundlesMap,
            banner: config.banner,
            varName: config.fullname,
          }),
        ].concat(
          bundles.map(opts => bundle({
            outDir: config.outDir,
            format: 'cjs',
            entry: opts.entry,
            bundleName: opts.bundleName,
            styleName: opts.styleName,
            external: nodeExternal(),
            modules: true,
            bundlesMap,
            banner: config.banner,
            varName: config.fullname,
          }))
        )
      )
    })
  })
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
function bundle (opts = {}) {
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

  const plugins = [
    ...(opts.modules ? [
      externalize({
        root: utils.resolve('src'),
        newRoot: 'vuelayers/dist',
        map: opts.bundlesMap,
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

  if (opts.env === 'production' && opts.format === 'umd') {
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

  const dest = path.join(opts.outDir, `${bundleName}.js`)
  let destCss = cssBundleName ? path.join(opts.outDir, cssBundleName + '.css') : undefined
  const spinner = ora(chalk.bold.blue(`cook ${bundleName} bundle...`)).start()

  return rollup.rollup({
    input: opts.entry,
    external: opts.external,
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
        opts.banner
      )

      return utils.postcssProcess({
        id: destCss,
        code,
        map,
      })
    }).then(css => ({ js, css }))
  }).then(({ js, css }) => Promise.all([
    utils.writeFile(dest, js.code),
    utils.writeFile(dest + '.map', js.map),
    ...(css ? [
      utils.writeFile(destCss, css.code),
      utils.writeFile(destCss + '.map', css.map),
    ] : []),
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

function nodeExternal () {
  const deps = [config.name].concat(Object.keys(dependencies))
    .concat(Object.keys(peerDependencies))
    .concat(Object.keys(devDependencies))

  return moduleId => deps.some(dep => new RegExp(`^${dep}.*$`, 'i').test(moduleId))
}

function replaces (opts = {}) {
  const obj = Object.assign({}, config.replaces, {
    '@import ~': '@import ',
    '@import "~': '@import "',
  })

  if (opts.env) {
    obj['process.env.NODE_ENV'] = opts.env
  }

  if (opts.format === 'cjs') {
    obj['lodash-es'] = 'lodash'
  }

  return obj
}

function getComponents () {
  const root = utils.resolve('src/components')

  return new Promise((resolve, reject) => {
    glob(root + '/**/*.js', (err, files) => {
      if (err) return reject(err)

      resolve(files.reduce((files, file) => {
        // skip main index and internal files
        let mainIndexRegex = /components\/index\.js$/
        let pkgIndex = path.join(path.dirname(file), 'index.js')
        let isInPkg = file !== pkgIndex && !mainIndexRegex.test(pkgIndex) && fs.existsSync(pkgIndex)
        if (mainIndexRegex.test(file) || isInPkg) {
          return files
        }

        let relPath = file.replace('.js', '').replace(root + '/', '')
        let pathParts = relPath.split('/')
        pathParts = pathParts.filter((x, i) => pathParts.indexOf(x) === i)

        // reverse all except some exclusions
        if (
          [
            'style/box/index',
            'style/container/index',
            'style/func/index',
          ].includes(relPath) === false
        ) {
          pathParts.reverse()
        }

        // component package
        if (/index$/.test(relPath)) {
          pathParts = pathParts.filter(x => x !== 'index')

          return files.concat({
            entry: file,
            bundleName: path.join('modules', pathParts.join('-'), 'index'),
            styleName: path.join('modules', pathParts.join('-'), 'style'),
            src: path.join('components', relPath).replace('/index', ''),
            dest: path.join('modules', pathParts.join('-')),
          })
        }

        // base mixins and helpers
        return files.concat({
          entry: file,
          bundleName: path.join('modules', 'mixins', pathParts.join('-')),
          styleName: false,
          src: path.join('components', relPath),
          dest: path.join('modules', 'mixins', pathParts.join('-')),
        })
      }, []))
    })
  })
}

function getCommons () {
  return Promise.resolve([
    {
      entry: utils.resolve('src/ol-ext/index.js'),
      bundleName: 'modules/ol-ext',
      styleName: false,
      src: 'ol-ext',
      dest: 'modules/ol-ext',
    }, {
      entry: utils.resolve('src/rx-ext/index.js'),
      bundleName: 'modules/rx-ext',
      styleName: false,
      src: 'rx-ext',
      dest: 'modules/rx-ext',
    }, {
      entry: utils.resolve('src/consts.js'),
      bundleName: 'modules/consts',
      styleName: false,
      src: 'consts',
      dest: 'modules/consts',
    },
  ])
}

function getUtils () {
  const root = utils.resolve('src/utils')

  return new Promise((resolve, reject) => {
    glob(root + '/**/*.js', (err, files) => {
      if (err) return reject(err)

      resolve(files.map(file => {
        let bundleName = path.join('modules/utils', path.basename(file, '.js'))

        return {
          entry: file,
          bundleName,
          styleName: false,
          src: file.replace('.js', '').replace(utils.resolve('src') + '/', ''),
          dest: bundleName,
        }
      }))
    })
  })
}
