const path = require('path')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const uglify = require('rollup-plugin-uglify')
const cjs = require('rollup-plugin-commonjs')
const node = require('rollup-plugin-node-resolve')
const replace = require('rollup-plugin-replace')
const vue = require('rollup-plugin-vue')
const ora = require('ora')
const config = require('./config')

const replaces = Object.keys(config.env)
  .reduce(
    (env, key) => Object.assign(env, {
      [ `process.env.${key}` ]: config.env[ key ]
    }),
    {}
  )

// todo add minification, postcss processing, source maps
const vueConfig = {
  compileTemplate: true,
  css: path.join(config.outDir, `${config.name}.esm.css`)
}

const rollupConfig = {
  entry: config.entry,
  banner: config.banner,
  moduleName: config.fullname,
  external: [ 'vue' ],
  plugins: [
    node(),
    vue(vueConfig),
    replace(replaces),
    babel(),
    cjs()
  ]
}

const spinner = ora('Loading...').start()

// ES6
rollup.rollup(rollupConfig)
  .then(bundler => bundler.write({
    format: 'es',
    dest: path.join(config.outDir, `${config.name}.esm.js`),
    sourceMap: true
  }))
  .catch(err => console.error(err.stack))
  .then(() => spinner.stop())
