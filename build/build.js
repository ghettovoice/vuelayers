const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
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

const vueConfig = {
  compileTemplate: true,
  styleToImports: true
}

const rollupConfig = {
  entry: config.entry,
  moduleName: config.fullname,
  external: [ 'vue' ],
  plugins: [
    node(),
    vue(vueConfig),
    replace(replaces),
    babel(),
    cjs(),
  ]
}

const spinner = ora('relax, your bundles are cooking...').start()

// ES6
rollup.rollup(rollupConfig)
  .then(bundler => {
    const dest = path.join(config.outDir, `${config.name}.esm.js`)
    const { code, map } = bundler.generate({
      format: 'es',
      banner: config.banner,
      sourceMap: true,
      sourceMapFile: path.join(config.outDir, `${config.name}.esm.js`)
    })

    return Promise.all([
      write(dest, code),
      write(path.join(config.outDir, `${config.name}.esm.js.map`), map.toString())
    ])
  })
  .catch(err => console.error(err.stack))
  .then(() => spinner.stop())

// helpers
function write (dest, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(dest, data, function (err) {
      if (err) return reject(err)

      console.log(chalk.bold(dest) + ' ' + chalk.gray(getSize(data)))
      resolve()
    })
  })
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}
