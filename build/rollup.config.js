const { escapeRegExp, noop } = require('lodash')
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
const baseConf = {
  external: makeExternal(config.dependencies),
  input: config.entry,
  output: {
    format: 'es',
    banner: config.banner,
    name: config.fullname,
    sourcemap: true,
  },
}
const baseUmdConf = (function () {
  const ol = {}
  const olInclude = {
    'ol/obj': true,
    'ol/geom/GeometryType': true,
    'ol/geom/GeometryLayout': true,
    'ol/events/EventType': true,
    'ol/CollectionEventType': true,
    'ol/ObjectEventType': true,
    'ol/render/EventType': true,
    'ol/source/TileEventType': true,
    'ol/source/VectorEventType': true,
    'ol/source/WMSServerType': true,
    'ol/source/State': true,
    'ol/MapBrowserEventType': true,
    'ol/MapEventType': true,
    'ol/OverlayPositioning': true,
    'ol/layer/VectorTileRenderType': true,
    'ol/extent/Corner': true,
    'ol/tilegrid/common': true,
    'ol/proj/Units': true,
    'ol/style/IconAnchorUnits': true,
    'ol/style/IconOrigin': true,
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
    plugins: makePlugins(false, null, `dist/${config.name}.css`),
    output: {
      ...baseConf.output,
      file: utils.resolve(`dist/${config.name}.esm.js`),
    },
  },
  {
    ...baseConf,
    external: makeExternal(config.dependencies.concat(['./ol-ext', './rx-ext', './utils'])),
    input: utils.resolve('src/mixins/index.js'),
    plugins: makePlugins(false, {
      '../ol-ext': './ol-ext',
      '../rx-ext': './rx-ext',
      '../utils': './utils',
    }),
    output: {
      ...baseConf.output,
      file: utils.resolve('dist/mixins.js'),
    },
  },
  {
    ...baseConf,
    external: makeExternal(config.dependencies.concat(['./utils'])),
    input: utils.resolve('src/ol-ext/index.js'),
    plugins: makePlugins(false, {
      '../utils': './utils',
    }),
    output: {
      ...baseConf.output,
      file: utils.resolve('dist/ol-ext.js'),
    },
  },
  {
    ...baseConf,
    external: makeExternal(config.dependencies.concat(['./utils'])),
    input: utils.resolve('src/rx-ext/index.js'),
    plugins: makePlugins(false, {
      '../utils': './utils',
    }),
    output: {
      ...baseConf.output,
      file: utils.resolve('dist/rx-ext.js'),
    },
  },
  {
    ...baseConf,
    input: utils.resolve('src/utils/index.js'),
    plugins: makePlugins(),
    output: {
      ...baseConf.output,
      file: utils.resolve('dist/utils.js'),
    },
  },
  // umd
  {
    ...baseUmdConf,
    plugins: makePlugins(false, {
      'process.env.NODE_ENV': "'production'",
      'process.env.VUELAYERS_DEBUG': 'false',
    }),
    output: {
      ...baseUmdConf.output,
      file: utils.resolve(`dist/${config.name}.umd.js`),
    },
  },
  {
    ...baseUmdConf,
    plugins: makePlugins(true, {
      'process.env.NODE_ENV': "'production'",
      'process.env.VUELAYERS_DEBUG': 'false',
    }, `dist/${config.name}.min.css`),
    output: {
      ...baseUmdConf.output,
      file: utils.resolve(`dist/${config.name}.umd.min.js`),
    },
  },
]

function makePlugins (min, replaces, cssOutput) {
  return [
    replace({
      sourceMap: true,
      include: [
        'src/**/*',
      ],
      replaces: {
        '@import ~': '@import ',
        '@import "~': '@import "',
        ...config.replaces,
        ...replaces,
      },
    }),
    vue({
      sourceMap: true,
      needMap: false,
      css: false,
    }),
    sass({
      output: cssOutput || noop,
      banner: config.banner,
      sourceMap: true,
      sass: {
        includePaths: [
          utils.resolve('src'),
          utils.resolve('src/styles'),
          utils.resolve('node_modules'),
        ],
      },
      postProcess: style => utils.postcssProcess(style, min),
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
    ...(min ? [
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
    ] : []),
  ]
}
