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

process.env.NODE_ENV = 'production'

const makeExternal = dependencies => {
  const deps = dependencies.map(dep => escapeRegExp(dep)).join('|')
  const re = new RegExp(`^(?:${deps})(?:/.+)?$`, 'i')
  return (id, parentId, resolved) => {
    return !!(dependencies.includes(id) || (!resolved && re.exec(id)))
  }
}
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
    needMap: false,
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
  external: makeExternal(config.dependencies),
  input: config.entry,
  output: {
    format: 'es',
    banner: config.banner,
    name: config.fullname,
    sourcemap: true,
  },
  plugins,
}
const baseUmdConf = (function () {
  const ol = {}
  const olInclude = {
    'ol/obj': true,
    'ol/geom/GeometryType': true,
    'ol/events/EventType': true,
    'ol/CollectionEventType': true,
    'ol/ObjectEventType': true,
    'ol/render/EventType': true,
    'ol/source/TileEventType': true,
    'ol/source/VectorEventType': true,
    'ol/source/WMSServerType': true,
    'ol/MapBrowserEventType': true,
    'ol/MapEventType': true,
    'ol/OverlayPositioning': true,
    'ol/layer/VectorTileRenderType': true,
    'ol/extent/Corner': true,
    'ol/tilegrid/common': true,
    'ol/proj/Units': true,
  }
  return {
    ...baseConf,
    external: (function () {
      const external = makeExternal(['vue', 'ol'])
      return (id, parentId, resolved) => {
        if (!resolved) {
          if (olInclude[id]) return false
          if (/^ol(?:\/.+)?$/.test(id)) {
            ol[id] = id.replace(/\//g, '.')
          }
        }
        return external(id, parentId, resolved)
      }
    }()),
    input: config.umdEntry,
    plugins: [
      replace({
        sourceMap: true,
        include: [
          'src/**/*',
        ],
        replaces: {
          'process.env.NODE_ENV': "'production'",
          'process.env.VUELAYERS_DEBUG': 'false',
        },
      }),
      ...plugins,
    ],
    output: {
      ...baseConf.output,
      format: 'umd',
      amd: { id: config.name },
      globals: id => {
        if (id === 'vue') return 'Vue'
        if (ol[id] != null) return ol[id]
      },
    },
  }
}())

module.exports = [
  // esm
  {
    ...baseConf,
    external: makeExternal(config.dependencies.concat(['../../mixins', '../../ol-ext', '../../rx-ext', '../../utils'])),
    output: {
      ...baseConf.output,
      file: utils.resolve(`dist/${config.name}.esm.js`),
    },
  },
  {
    ...baseConf,
    external: makeExternal(config.dependencies.concat(['./ol-ext', './rx-ext', './utils'])),
    input: utils.resolve('src/mixins/index.js'),
    plugins: [
      ...baseConf.plugins,
      replace({
        sourceMap: true,
        include: [
          'src/**/*',
        ],
        replaces: {
          '../ol-ext': './ol-ext',
          '../rx-ext': './rx-ext',
          '../utils': './utils',
        },
      }),
    ],
    output: {
      ...baseConf.output,
      file: utils.resolve('dist/mixins.js'),
    },
  },
  {
    ...baseConf,
    external: makeExternal(config.dependencies.concat(['./utils'])),
    input: utils.resolve('src/ol-ext/index.js'),
    plugins: [
      ...baseConf.plugins,
      replace({
        sourceMap: true,
        include: [
          'src/**/*',
        ],
        replaces: {
          '../utils': './utils',
        },
      }),
    ],
    output: {
      ...baseConf.output,
      file: utils.resolve('dist/ol-ext.js'),
    },
  },
  {
    ...baseConf,
    external: makeExternal(config.dependencies.concat(['./utils'])),
    input: utils.resolve('src/rx-ext/index.js'),
    plugins: [
      ...baseConf.plugins,
      replace({
        sourceMap: true,
        include: [
          'src/**/*',
        ],
        replaces: {
          '../utils': './utils',
        },
      }),
    ],
    output: {
      ...baseConf.output,
      file: utils.resolve('dist/rx-ext.js'),
    },
  },
  {
    ...baseConf,
    input: utils.resolve('src/utils/index.js'),
    output: {
      ...baseConf.output,
      file: utils.resolve('dist/utils.js'),
    },
  },
  // umd
  {
    ...baseUmdConf,
    output: {
      ...baseUmdConf.output,
      file: utils.resolve(`dist/${config.name}.umd.js`),
    },
  },
  {
    ...baseUmdConf,
    plugins: [
      ...baseUmdConf.plugins,
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
