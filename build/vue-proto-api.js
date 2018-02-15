/**
 * CLI helper to initially generate doc api files from *.vue files.
 *
 * @example bash
 * node vue-proto-api.js ./src/component.vue [./api/component.js]
 */
const path = require('path')
const jsdoc = require('jsdoc-api')
const fs = require('fs-extra')
const util = require('util')
const { kebabCase } = require('lodash/fp')

let src = process.argv[2]
let dest = process.argv[3]

jsdoc.explain({
  files: path.resolve(process.cwd(), src),
  cache: false,
  configure: path.resolve(__dirname, '../.jsdoc.js'),
}).then(doclets => {
  let vueProtoParts = extractVueProtoParts(doclets)
  let vueProtoApi = {
    props: vueProtoParts.props.map(mapProp),
    members: vueProtoParts.otherMembers.map(mapMember),
    methods: vueProtoParts.methods.map(mapMethod),
    events: vueProtoParts.events.map(mapEvents),
    slots: vueProtoParts.slots.map(mapSlot),
  }

  let data = `export default ${util.inspect(vueProtoApi, {depth: null})}`

  if (dest) {
    return fs.outputFile(path.resolve(process.cwd(), dest), data)
  }

  console.log(data)
}).catch(err => console.error('failed to parse vue proto api', err))

function mapProp (doclet) {
  // noinspection PointlessBooleanExpressionJS
  return {
    name: kebabCase(cleanString(doclet.name)),
    description: cleanString(doclet.description),
    type: cleanString(doclet.typeExpression),
    required: !!doclet.required,
    sync: !!doclet.vueSync,
    default: cleanString(doclet.defaultvalue),
  }
}

function mapMember (doclet) {
  return {
    name: cleanString(doclet.name),
    description: cleanString(doclet.description),
    type: cleanString(doclet.typeExpression),
  }
}

function mapMethod (doclet) {
  return {
    name: cleanString(doclet.name),
    description: cleanString(doclet.description),
    arguments: (doclet.params || []).map(par => ({
      name: cleanString(par.name),
      description: cleanString(par.description),
      optional: !!par.optional,
      type: cleanString(par.typeExpression),
    })),
    returns: (doclet.returns || []).map(ret => ({
      type: cleanString(ret.typeExpression),
      description: cleanString(ret.description),
    })),
  }
}

function mapEvents (doclet) {
  return {
    name: cleanString(doclet.name),
    description: cleanString(doclet.description),
    argument: cleanString(doclet.typeExpression),
  }
}

function mapSlot (doclet) {
  return {
    name: cleanString(doclet.name),
    description: cleanString(doclet.description),
    scoped: !!doclet.scoped,
  }
}

function cleanString (str) {
  return (str || '').replace('\n', ' ')
}

function isPublic ({access, undocumented}) {
  return !undocumented && (!access || access === 'public')
}

function findMainDoclet (doclets) {
  return doclets.find(({name, longname, vueProto}) => name === longname || vueProto)
}

function extractVueProtoParts (doclets) {
  let protoDoclet = findMainDoclet(doclets)

  let props = []
  let dataProps = []
  let compProps = []
  let otherMembers = []
  let methods = []
  let events = []

  doclets.forEach(child => {
    if (!isPublic(child) || child.memberof !== protoDoclet.longname) {
      return
    }

    let group
    switch (true) {
      case child.vueProp:
        group = props
        break
      case child.vueComputedProp:
        group = compProps
        break
      case child.vueDataProp:
        group = dataProps
        break
      case child.kind === 'member' && child.scope === 'instance':
        group = otherMembers
        break
      case child.vueMethod:
        group = methods
        break
      case child.kind === 'event':
        group = events
        break
    }

    if (group) {
      group.push(child)
    }
  })
  props.sort(alphabetSorter)
  compProps.sort(alphabetSorter)
  dataProps.sort(alphabetSorter)
  otherMembers.sort(alphabetSorter)
  methods.sort(alphabetSorter)
  events.sort(alphabetSorter)

  let slots = (protoDoclet.slots || []).slice().sort(alphabetSorter)

  return {
    props,
    compProps,
    dataProps,
    otherMembers,
    methods,
    events,
    slots,
  }
}

function alphabetSorter (a, b) {
  return a.name.toLowerCase() === b.name.toLowerCase() ? 0 : (
    a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
  )
}
