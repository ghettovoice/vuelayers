const path = require('path')
const fs = require('fs-extra')
const { template, find, matches, omit } = require('lodash/fp')
const loaderUtils = require('loader-utils')
const marked = require('marked')
const hljs = require('highlight.js')

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
      let mdOpts = markdownOptions()
      parseMarkdown(doclet, mdOpts)
      children.forEach(doclet => parseMarkdown(doclet, mdOpts))

      return fs.readFile(tplPath, 'utf8')
        .then(tplSource => {
          let tplFunc = template(tplSource)

          return tplFunc({
            doclet,
            children,
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

  // find module components
  // const components = jsdocDoclets.filter(({ memberof, undocumented, kind }) => {
  //   return memberof === moduleDoclet.longname && kind === 'member' && !undocumented
  // }).reduce((components, { name, memberof }) => {
  //   let cmpLongname = [memberof, kebabCase(lowerFirst(name))].join('/')
  //   let component = jsdocDoclets.find(({ vueProto, longname, undocumented }) => vueProto && longname === cmpLongname && !undocumented)
  //
  //   if (component) {
  //     component.members = jsdocDoclets.filter(({ memberof, undocumented }) => memberof === cmpLongname && !undocumented)
  //   }
  //
  //   return components.concat(component)
  // }, [])
}

function findChildren (doclets, parent) {
  return doclets.reduce((all, doclet) => {
    if (doclet.memberof === parent.longname) {
      all.push(doclet, ...findChildren(doclets, doclet))
    }

    return all
  }, [])
}

function markdownOptions () {
  // todo move to loader options
  return {
    breaks: true,
    langPrefix: 'hljs ',
    highlight: (code, lang) => lang ? hljs.highlight(lang, code).value : code,
  }
}

function parseMarkdown (doclet, options) {
  const tags = [
    'author',
    'classdesc',
    'description',
    'exceptions',
    'params',
    'properties',
    'returns',
    'see',
    'summary',
    'examples',
  ]

  tags.forEach(tag => {
    if (!doclet.hasOwnProperty(tag)) {
      return
    }

    if (typeof doclet[tag] === 'string') {
      doclet[tag] = marked(doclet[tag], options)
    } else if (Array.isArray(doclet[tag])) {
      doclet[tag].forEach((value, index, original) => {
        let inner = {}

        inner[tag] = value
        parseMarkdown(inner, options)
        original[index] = inner[tag]
      })
    } else if (doclet[tag]) {
      parseMarkdown(doclet[tag], options)
    }
  })
}
