const path = require('path')
const chalk = require('chalk')
const ora = require('ora')
const rollup = require('rollup')
const postcss = require('postcss')
const babel = require('rollup-plugin-babel')
const cjs = require('rollup-plugin-commonjs')
const resolve = require('rollup-plugin-node-resolve')
const globals = require('rollup-plugin-node-globals')
const builtins = require('rollup-plugin-node-builtins')
const replace = require('rollup-plugin-replace')
const vue = require('rollup-plugin-vue')
const { dependencies, peerDependencies } = require('../package.json')
const utils = require('./utils')
const config = require('./config')

utils.ensureDir(utils.resolve('dist'))

Promise.resolve()
  .then(() => bundle({
    format: 'es',
    entry: config.esEntry,
    replaces: replaces(),
    external: nodeExternal()
  }))
  // fixme currently disabled due to errors when work with transform-runtime,
  // .then(() => bundle({
  //   format: 'cjs',
  //   entry: config.entry,
  //   replaces: replaces(),
  //   external: nodeExternal()
  // }))
  // .then(() => bundle({
  //   format: 'umd',
  //   entry: config.entry,
  //   replaces: replaces(),
  //   external: [ 'vue' ]
  // }))
  .catch(err => {
    console.error(chalk.red(err.stack))
    process.exit(1)
  })

// helpers
function bundle (opts = {}) {
  const baseName = `${config.name}.${opts.format}`
  const dest = path.join(config.outDir, `${baseName}.js`)

  const spinner = ora(chalk.bold.blue(`cook ${opts.format} bundle...`)).start()
  let postcssPromise = []

  return rollup.rollup({
      entry: opts.entry,
      external: opts.external,
      plugins: [
        replace(opts.replaces),
        vue({
          compileTemplate: true,
          htmlMinifier: { collapseBooleanAttributes: false },
          scss: {
            outputStyle: 'compressed',
            includePaths: [
              utils.resolve('src'),
              utils.resolve('node_modules')
            ]
          },
          css: style => {
            postcssPromise = postcssProcess(baseName, style)
          }
        }),
        babel({ runtimeHelpers: true }),
        resolve(),
        cjs(),
        globals(),
        builtins()
      ]
    })
    .then(bundler => {
      const { code, map } = bundler.generate({
        format: opts.format,
        banner: config.banner,
        moduleName: config.fullname,
        sourceMap: true
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

      if (cssSrc && cssMap) {
        console.log(cssSrc.path + ' ' + chalk.gray(cssSrc.size))
        console.log(cssMap.path + ' ' + chalk.gray(cssMap.size))
      }
    })
    .catch(err => {
      spinner.fail(chalk.red(`${opts.format} bundle is failed to create`))
      throw err
    })
}

function postcssProcess (baseName, style) {
  const dest = path.join(config.outDir, `${baseName}.css`)

  return postcss(utils.postcssPlugins())
    .process(config.banner + style, {
      from: 'src/index.css',
      to: `dist/${baseName}.css`
    })
    .then(({ css, map }) => Promise.all([
      utils.writeFile(dest, css),
      utils.writeFile(dest + '.map', css),
    ]))
}

function nodeExternal () {
  const deps = Object.keys(dependencies)
    .concat(Object.keys(peerDependencies))

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
