const path = require('path')
const chalk = require('chalk')
const ora = require('ora')
const rollup = require('rollup')
const postcss = require('postcss')
const babel = require('rollup-plugin-babel')
const cjs = require('rollup-plugin-commonjs')
const resolve = require('rollup-plugin-node-resolve')
const replace = require('rollup-plugin-replace')
const vue = require('rollup-plugin-vue')
const uglify = require('rollup-plugin-uglify')
const { dependencies, peerDependencies, devDependencies } = require('../package.json')
const utils = require('./utils')
const config = require('./config')

utils.ensureDir(utils.resolve('dist'))

Promise.resolve()
  .then(() => bundle({
    format: 'es',
    entry: config.entry,
    external: nodeExternal()
  }))
  .then(() => bundle({
    format: 'cjs',
    entry: config.defEntry,
    external: nodeExternal()
  }))
  .then(() => bundle({
    format: 'umd',
    entry: config.defEntry,
    env: 'development',
    external: [ 'vue' ]
  }))
  .then(() => bundle({
    format: 'umd',
    entry: config.defEntry,
    env: 'production',
    external: [ 'vue' ]
  }))
  .catch(err => {
    console.error(chalk.red(err.stack))
    process.exit(1)
  })

// helpers
function bundle (opts = {}) {
  let baseName = `${config.name}.${opts.format}`

  if (opts.format === 'cjs') {
    process.env.BABEL_ENV = 'cjs'
  } else {
    delete process.env.BABEL_ENV
  }

  const plugins = [
    replace(replaces(opts.env)),
    vue({
      compileTemplate: true,
      htmlMinifier: { collapseBooleanAttributes: false },
      scss: {
        outputStyle: 'compressed',
        sourceMap: true,
        sourceMapEmbed: true,
        includePaths: [
          utils.resolve('src'),
          utils.resolve('node_modules')
        ]
      },
      // todo process each style with postcss, then concatenate sources and source maps
      css: (style, styles) => {
        postcssPromise = postcssProcess(baseName, style)
      }
    }),
    babel({
      runtimeHelpers: true,
      include: [
        'src/**/*',
        'node_modules/ol-tilecache/**/*'
      ]
    }),
    resolve({
      main: true,
      module: true,
      jsnext: true,
      browser: true
    }),
    cjs()
  ]

  if (opts.env === 'production') {
    baseName += '.min'

    plugins.push(
      uglify({
        mangle: true,
        sourceMap: true,
        compress: {
          warnings: false
        },
        output: {
          comments: function(node, comment) {
            let text = comment.value
            let type = comment.type
            if (type == "comment2") {
              // multiline comment
              return /@preserve|@license|@cc_on/i.test(text)
            }
          }
        }
      })
    )
  }

  const dest = path.join(config.outDir, `${baseName}.js`)
  const spinner = ora(chalk.bold.blue(`cook ${opts.format} bundle...`)).start()
  let postcssPromise

  return rollup.rollup({
      entry: opts.entry,
      external: opts.external,
      plugins
    })
    .then(bundler => {
      const { code, map } = bundler.generate({
        format: opts.format,
        banner: config.banner,
        moduleName: config.fullname,
        moduleId: config.name,
        sourceMap: true,
        sourceMapFile: dest
      })

      return Promise.all([
        utils.writeFile(dest, code),
        utils.writeFile(dest + '.map', map.toString()),
        postcssPromise
      ])
    })
    .then(([ jsSrc, jsMap, [ cssSrc, cssMap ] ]) => {
      spinner.succeed(chalk.green(`${opts.format} bundle is ready`))

      console.log(jsSrc.path + ' ' + chalk.gray(jsSrc.size))
      console.log(jsMap.path + ' ' + chalk.gray(jsMap.size))

      cssSrc && console.log(cssSrc.path + ' ' + chalk.gray(cssSrc.size))
      cssMap && console.log(cssMap.path + ' ' + chalk.gray(cssMap.size))
    })
    .catch(err => {
      spinner.fail(chalk.red(`${opts.format} bundle is failed to create`))
      throw err
    })
}

function postcssProcess (baseName, style) {
  const dest = path.join(config.outDir, `${baseName}.css`)

  return postcss(utils.postcssPlugins())
    .process(config.banner + style)
    .then(({ css, map }) => Promise.all([
      utils.writeFile(dest, css),
      // utils.writeFile(dest + '.map', map.toString()),
    ]))
}

function nodeExternal () {
  const deps = Object.keys(dependencies)
    .concat(Object.keys(peerDependencies))
    .concat(Object.keys(devDependencies))

  return moduleId => deps.some(dep => new RegExp(`^${dep}.*$`, 'i').test(moduleId))
}

function replaces (env) {
  const obj = Object.assign({}, config.replaces, {
    '~': ''
  })

  if (env) {
    obj[ 'process.env.NODE_ENV' ] = env
  }

  return obj
}
