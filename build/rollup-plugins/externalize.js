const path = require('path')
const pluginUtils = require('rollup-pluginutils')
const MagicString = require('magic-string')
const cloneRegExp = require('clone-regexp')

module.exports = function externalize (options) {
  options = Object.assign({
    root: process.cwd(),
    newRoot: process.cwd(),
    include: 'src/**',
    exclude: 'node_modules/**',
    regExp: /'(\.{1,2}\/)+([^.'\n]+)'/g,
    map: {},
  }, options)

  const filter = pluginUtils.createFilter(options.include, options.exclude)

  return {
    name: 'externalize',
    transform (code, id) {
      if (!filter(id)) return

      const ms = new MagicString(code)
      const regExp = cloneRegExp(options.regExp)
      let match, start, end, hasReplacements

      while ((match = regExp.exec(code)) != null) {
        // start, end without quotes
        start = match.index + 1
        end = start + match[0].length - 2

        let extModulePath = path.resolve(path.dirname(id), match[0].slice(1, -1))
        let extModuleRelPath = path.relative(options.root, extModulePath)
        let extModuleMap = options.map.find(({ src }) => src === extModuleRelPath)

        if (extModuleMap) {
          ms.overwrite(start, end, path.join(options.newRoot, extModuleMap.dest))
          hasReplacements = true
        }
      }

      if (!hasReplacements) return

      return {
        code: ms.toString(),
        map: ms.generateMap({
          file: id,
          source: id,
          includeContent: true,
          hires: true,
        }).toString(),
      }
    },
  }
}
