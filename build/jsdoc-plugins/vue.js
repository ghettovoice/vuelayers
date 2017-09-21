const compiler = require('vue-template-compiler')

exports.handlers = {
  beforeParse (evt) {
    if (/\.vue$/.test(evt.filename)) {
      const parsedComponent = compiler.parseComponent(evt.source)
      evt.source = parsedComponent.script ? parsedComponent.script.content : ''
    }
  },
  newDoclet (evt) {
    if (evt.doclet.vueCmp) {
      evt.doclet.alias = `(Cmp) ${evt.doclet.cmp}`
      console.log(evt.doclet)
    } else if (evt.doclet.vueProp) {
      evt.doclet.alias = `(Prop) ${evt.doclet.name}`
      console.log(evt.doclet)
    }
  },
}

exports.defineTags = function (dict) {
  dict.defineTag('vueCmp', {
    mustHaveValue: true,
    onTagged (doclet, tag) {
      doclet.vueCmp = tag.value
    },
  })

  dict.defineTag('vueProp', {
    mustHaveValue: false,
    onTagged (doclet) {
      doclet.vueProp = true
    },
  })
}
