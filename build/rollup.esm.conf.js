const path = require('path')
const chalk = require('chalk')
const postcss = require('postcss')
const babel = require('rollup-plugin-babel')
const cjs = require('rollup-plugin-commonjs')
const node = require('rollup-plugin-node-resolve')
const replace = require('rollup-plugin-replace')
const vue = require('rollup-plugin-vue')
const utils = require('./utils')
const config = require('./config')
const { dependencies, peerDependencies } = require('../package.json')

const replaces = Object.keys(config.env)
  .reduce(
    (all, key) => Object.assign(all, {
      [ `process.env.${key}` ]: config.env[ key ]
    }),
    {}
  )
replaces['~'] = ''

const vueConfig = {
  compileTemplate: true,
  htmlMinifier: {
    collapseBooleanAttributes: false
  },
  css: style => {
    const dest = path.join(config.outDir, `${config.name}.esm.css`)

    postcss(utils.postcssPlugins())
      .process(config.banner + style, {
        from: 'src/components/map.vue',
        to: `dist/${config.name}.esm.css`
      })
      .then(({ css, map }) => Promise.all([
        utils.writeFile(dest, css),
        utils.writeFile(dest + '.map', css),
      ]))
      .then(([ sourceResult, mapResult ]) => {
        console.log('\n' + chalk.bold.green('css ready'))
        console.log(chalk.bold(sourceResult.path) + ' ' + chalk.gray(sourceResult.size))
        console.log(chalk.bold(mapResult.path) + ' ' + chalk.gray(mapResult.size))
      })
  },
  scss: {
    outputStyle: 'compressed',
    includePaths: [
      utils.resolve('src'),
      utils.resolve('node_modules')
    ]
  }
}

const dest = path.join(config.outDir, `${config.name}.esm.js`)
const deps = Object.keys(dependencies)
  .concat(Object.keys(peerDependencies))

module.exports = {
  format: 'es',
  entry: config.entry,
  dest,
  banner: config.banner,
  moduleName: config.fullname,
  sourceMap: true,
  sourceMapFile: dest + '.map',
  external: moduleId => deps.some(dep => new RegExp(`^${dep}.*$`, 'i').test(moduleId)),
  plugins: [
    replace(replaces),
    vue(vueConfig),
    babel(),
    node(),
    cjs()
  ]
}
