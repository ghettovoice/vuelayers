const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const ora = require('ora')
const glob = require('glob')
const rollup = require('rollup')
const postcss = require('postcss')
const babel = require('rollup-plugin-babel')
const cjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')
const replace = require('rollup-plugin-replace')
const vue = require('rollup-plugin-vue')
const uglify = require('rollup-plugin-uglify')
const createFilter = require('rollup-pluginutils').createFilter
const MagicString = require('magic-string')
const notifier = require('node-notifier')
const argv = require('yargs').argv
const { dependencies, peerDependencies, devDependencies } = require('../package.json')
const utils = require('./utils')
const config = require('./config')

const bundles = argv.bundles
  ? argv.bundles.split(',').map(s => s.trim())
  : [ 'es', 'umd', 'umd-min', 'cjs', 'comp' ]

Promise.resolve(utils.ensureDir(config.outDir))
  // ES6
  .then(() => bundles.includes('es') && bundle({
    format: 'es',
    bundleName: config.name + '.es',
    entry: config.entry,
    external: nodeExternal()
  }))
  // CommonJS
  .then(() => bundles.includes('cjs') && bundle({
    format: 'cjs',
    bundleName: config.name + '.cjs',
    entry: config.cjsEntry,
    external: nodeExternal()
  }))
  // UMD
  .then(() => bundles.includes('umd') && bundle({
    format: 'umd',
    bundleName: config.name + '.umd',
    entry: config.cjsEntry,
    env: 'development',
    external: [ 'vue', 'openlayers', 'ol' ],
    globals: {
      vue: 'Vue',
      openlayers: 'ol'
    }
  }))
  // UMD minified
  .then(() => bundles.includes('umd-min') && bundle({
    format: 'umd',
    bundleName: config.name + '.umd.min',
    entry: config.cjsEntry,
    env: 'production',
    external: [ 'vue', 'openlayers', 'ol' ],
    globals: {
      vue: 'Vue',
      openlayers: 'ol'
    }
  }))
  // Separate CommonJS modules
  .then(() => {
    return bundles.includes('comp') && bundle({
        format: 'cjs',
        bundleName: 'modules/index',
        styleName: 'modules/style',
        entry: config.cjsEntry,
        external: nodeExternal()
      }).then(() => Promise.all([
          getUtils(),
          getCommons(),
          getComponents()
        ]))
        .then(result => {
          let bundles = result.reduce((all, bundles) => all.concat(bundles), [])
          let bundlesMap = bundles.map(({ src, dest }) => ({ src, dest }))

          return Promise.all(bundles.map(opts => bundle({
            format: 'cjs',
            entry: opts.entry,
            bundleName: opts.bundleName,
            styleName: opts.styleName,
            external: nodeExternal(),
            modules: true,
            bundlesMap
          })))
        })
  })
  // All done
  .then(() => {
    notifier.notify({
      title: config.fullname,
      message: 'Excellent, all bundles are ready!'
    })
  })
  .catch(err => {
    console.error(chalk.red(err.stack))
    process.exit(1)
  })

// helpers
function bundle (opts = {}) {
  let bundleName = opts.bundleName

  if (['cjs', 'umd'].includes(opts.format)) {
    process.env.BABEL_ENV = 'production-cjs'
  } else {
    process.env.BABEL_ENV = 'production'
  }

  const plugins = [
    ...(opts.modules ? [ externalize(opts.bundlesMap) ] : []),
    replace(Object.assign(replaces(opts), {
      sourceMap: true
    })),
    vue({
      compileTemplate: true,
      htmlMinifier: { collapseBooleanAttributes: false },
      sourceMap: true,
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
      css: style => {
        postcssPromise = opts.styleName !== false
          ? postcssProcess(opts.styleName || bundleName, style)
          : Promise.resolve([])
      }
    }),
    babel({
      runtimeHelpers: true,
      sourceMap: true,
      include: [
        'src/**/*',
        'node_modules/ol-tilecache/**/*'
      ]
    }),
    nodeResolve({
      main: true,
      module: true,
      jsnext: true,
      browser: true,
      preferBuiltins: false
    }),
    cjs()
  ]

  if (opts.env === 'production' && opts.format === 'umd') {
    plugins.push(
      uglify({
        mangle: true,
        sourceMap: true,
        compress: {
          warnings: false
        },
        output: {
          comments: (node, comment) => {
            let text = comment.value
            let type = comment.type
            if (type === "comment2") {
              // multiline comment
              return /@preserve|@license|@cc_on/i.test(text)
            }
          }
        }
      })
    )
  }

  const dest = path.join(config.outDir, `${bundleName}.js`)
  const spinner = ora(chalk.bold.blue(`cook ${bundleName} bundle...`)).start()
  let postcssPromise

  return Promise.resolve(utils.ensureDir(path.dirname(dest)))
    .then(() => rollup.rollup({
      entry: opts.entry,
      external: opts.external,
      plugins
    }))
    .then(bundler => bundler.generate({
      format: opts.format,
      banner: config.banner,
      moduleName: config.fullname,
      // moduleId: config.name,
      sourceMap: true,
      sourceMapFile: dest,
      globals: opts.globals
    }))
    .then(({ code, map }) => Promise.all([
      utils.writeFile(dest, code),
      utils.writeFile(dest + '.map', map.toString()),
      postcssPromise
    ]))
    .then(([ jsSrc, jsMap, [ cssSrc, cssMap ] ]) => {
      spinner.succeed(chalk.green(`${bundleName} bundle is ready`))

      console.log(jsSrc.path + ' ' + chalk.gray(jsSrc.size))
      console.log(jsMap.path + ' ' + chalk.gray(jsMap.size))

      cssSrc && console.log(cssSrc.path + ' ' + chalk.gray(cssSrc.size))
      cssMap && console.log(cssMap.path + ' ' + chalk.gray(cssMap.size))
    })
    .catch(err => {
      spinner.fail(chalk.red(`${bundleName} bundle is failed to create`))
      throw err
    })
}

function postcssProcess (bundleName, style) {
  const dest = path.join(config.outDir, `${bundleName}.css`)

  return postcss(utils.postcssPlugins())
    .process(style ? config.banner + style : '')
    .then(({ css, map }) => Promise.all([
      utils.writeFile(dest, css),
      // utils.writeFile(dest + '.map', map.toString()),
    ]))
}

function nodeExternal () {
  const deps = [ config.name ].concat(Object.keys(dependencies))
    .concat(Object.keys(peerDependencies))
    .concat(Object.keys(devDependencies))

  return moduleId => deps.some(dep => new RegExp(`^${dep}.*$`, 'i').test(moduleId))
}

function replaces (opts = {}) {
  const obj = Object.assign({}, config.replaces, {
    '~': ''
  })

  if (opts.env) {
    obj[ 'process.env.NODE_ENV' ] = opts.env
  }

  if (opts.format === 'cjs') {
    obj['lodash-es'] = 'lodash'
  }

  Object.assign(obj, opts.customReplaces)

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
            'style/func/index'
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
            dest: path.join('modules', pathParts.join('-'))
          })
        }

        // base mixins and helpers
        return files.concat({
          entry: file,
          bundleName: path.join('modules', 'mixins', pathParts.join('-')),
          styleName: false,
          src: path.join('components', relPath),
          dest: path.join('modules', 'mixins', pathParts.join('-'))
        })
      }, []))
    })
  })
}

function getCommons () {
  return Promise.resolve([ {
    entry: utils.resolve('src/ol-ext/index.js'),
    bundleName: 'modules/ol-ext',
    styleName: false,
    src: 'ol-ext',
    dest: 'modules/ol-ext'
  }, {
    entry: utils.resolve('src/rx-ext/index.js'),
    bundleName: 'modules/rx-ext',
    styleName: false,
    src: 'rx-ext',
    dest: 'modules/rx-ext'
  }, {
    entry: utils.resolve('src/consts.js'),
    bundleName: 'modules/consts',
    styleName: false,
    src: 'consts',
    dest: 'modules/consts'
  } ])
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
          dest: bundleName
        }
      }))
    })
  })
}

function externalize (modulesMap) {
  const filter = createFilter('src/**', 'node_modules/**')
  const regex = /'(\.{1,2}\/)+([^.'\n]+)'/g

  return {
    name: 'externalize',
    transform (code, id) {
      if (!filter(id)) return null

      const ms = new MagicString(code)
      let match, start, end, hasReplacements

      while (match = regex.exec(code)) {
        // start, end without quotes
        start = match.index + 1
        end = start + match[ 0 ].length - 2

        let extModulePath = path.resolve(path.dirname(id), match[0].slice(1, -1))
        let extModuleRelPath = extModulePath.replace(utils.resolve('src') + '/', '')
        let extModuleMap = modulesMap.find(({ src }) => src === extModuleRelPath)

        if (extModuleMap) {
          ms.overwrite(start, end, path.join('vuelayers/dist', extModuleMap.dest))
          hasReplacements = true
        }
      }

      if (!hasReplacements) return null

      return {
        code: ms.toString(),
        map: ms.generateMap({ hires: true })
      }
    }
  }
}
