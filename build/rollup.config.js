const { escapeRegExp } = require('lodash')
const replace = require('rollup-plugin-re')
const vue = require('rollup-plugin-vue')
const babel = require('@rollup/plugin-babel').babel
const nodeResolve = require('@rollup/plugin-node-resolve').nodeResolve
const cjs = require('@rollup/plugin-commonjs')
const sass = require('./rollup/sass')
const terser = require('rollup-plugin-terser').terser
const utils = require('./utils')
const config = require('./config')

const plugins = [
  replace({
    sourceMap: true,
    include: [
      'src/**/*',
    ],
    replaces: Object.assign({
      '@import ~': '@import ',
      '@import "~': '@import "',
    }, config.replaces),
  }),
  vue({
    sourceMap: true,
    // needMap: false,
    css: false,
  }),
  sass({
    banner: config.banner,
    sourceMap: true,
    sass: {
      indentedSyntax: true,
      includePaths: [
        utils.resolve('src'),
        utils.resolve('src/styles'),
        utils.resolve('node_modules'),
      ],
    },
    output: 'dist/vuelayers.css',
    postProcess: style => utils.postcssProcess(style),
  }),
  babel({
    babelHelpers: 'runtime',
    sourceMap: true,
    include: [
      'src/**/*',
    ],
    extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.vue'],
  }),
  nodeResolve({
    mainFields: ['module', 'main'],
    browser: true,
    sourceMap: true,
  }),
  cjs({
    sourceMap: true,
  }),
]
const baseConf = {
  external: (function () {
    const deps = config.dependencies.map(dep => escapeRegExp(dep)).join('|')
    const re = new RegExp(`^(?:${deps})(?:/.+)?$`, 'i')
    return (id, parentId, resolved) => {
      return !!(config.dependencies.includes(id) || (!resolved && re.exec(id)))
    }
  }()),
  input: config.entry,
  output: {
    file: utils.resolve(`dist/${config.name}.esm.js`),
    format: 'es',
    banner: config.banner,
    name: config.fullname,
    amd: { id: config.name },
    sourcemap: true,
  },
  plugins,
}
const baseUmdConf = (function () {
  const ol = {}
  return {
    ...baseConf,
    external: (function () {
      const deps = ['vue', 'ol'].map(dep => escapeRegExp(dep)).join('|')
      const re = new RegExp(`^(?:${deps})(?:/.+)?$`, 'i')
      return (id, parentId, resolved) => {
        if (!resolved && /^ol(?:\/.+)?$/.test(id)) {
          ol[id] = id.replace(/\//g, '.')
        }
        return !!(!resolved && re.exec(id))
      }
    }()),
    input: config.umdEntry,
    output: {
      ...baseConf.output,
      file: utils.resolve(`dist/${config.name}.umd.js`),
      format: 'umd',
      globals: id => {
        if (id === 'vue') return 'Vue'
        if (ol[id] != null) return ol[id]
      },
    },
  }
}())

module.exports = [
  // esm
  baseConf,
  // umd
  baseUmdConf,
  // umd min
  {
    ...baseUmdConf,
    plugins: [
      ...plugins,
      terser({
        mangle: true,
        compress: {
          warnings: false,
        },
        output: {
          comments: false,
          preamble: config.banner,
        },
      }),
    ],
    output: {
      ...baseUmdConf.output,
      file: utils.resolve(`dist/${config.name}.umd.min.js`),
    },
  },
]
