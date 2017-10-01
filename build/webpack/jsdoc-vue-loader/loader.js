const path = require('path')
const fs = require('fs-extra')
const { template, find, matches, omit } = require('lodash/fp')
const loaderUtils = require('loader-utils')

const emptyDocCmp = `
<template>
  <div></div>
</template>
<script>
  export default {
    name: 'empty-doc',
  }
</script>
`

module.exports = function (source) {
  const callback = this.async()
  this.cacheable && this.cacheable()

  const options = loaderUtils.getOptions(this) || {}
  const params = loaderUtils.parseQuery(this.resourceQuery) || {}
  const opts = Object.assign({}, options, params)

  let jsdocDoclets = JSON.parse(source)
  let tplPath = opts.tpl
  let matchObj = omit(['tpl'], opts)
  if (!path.isAbsolute(tplPath)) {
    tplPath = path.resolve(this.context, tplPath)
  }
  this.addDependency(tplPath)

  Promise.resolve(matchObj)
    .then(forSearch => {
      // find main module entry doclet and child members
      const matchesPredicate = matches(forSearch)
      let doclet = find(doclet => !doclet.undocumented && matchesPredicate(doclet), jsdocDoclets)
      if (!doclet) {
        throw new Error('Doclet not found by search object: ' + JSON.stringify(forSearch))
      }

      return doclet
    })
    .then(doclet => {
      return {
        doclet,
        children: findChildren(jsdocDoclets, doclet),
      }
    })
    .then(({ doclet, children }) => {
      return fs.readFile(tplPath, 'utf8')
        .then(tplSource => {
          let tplFunc = template(tplSource)

          return tplFunc({
            doclet,
            children,
            allDoclets: jsdocDoclets,
            '_': require('lodash'),
            resourceDir: this.context,
            resourcePath: this.resourcePath,
          })
        })
    })
    .then(cmpSource => callback(null, cmpSource))
    .catch(err => {
      this.emitWarning(err)
      callback(null, emptyDocCmp)
    })
}

function findChildren (doclets, parent) {
  return doclets.reduce((all, doclet) => {
    if (doclet.memberof === parent.longname) {
      all.push(doclet, ...findChildren(doclets, doclet))
    }

    return all
  }, [])
}
