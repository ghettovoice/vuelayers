const {alphabetSorter} = require('./utils')

exports.nameToIdent = string => string.replace(/^module:/, '').replace('/', '-').toLowerCase()

exports.isPublic = ({access, undocumented}) => !undocumented && (!access || access === 'public')

exports.mapExamples = examples => (examples || []).map(function (example) {
  let caption, code
  let lang = ''
  let match = example.match(/^\s*(?:<caption>)?([^[\]\n\r]+?)?(?:<\/caption>)?(?:\s*\[([\w]*)])?[\n\r]([\s\S]+)$/i)

  if (match) {
    caption = match[1] || 'Example'
    lang = match[2] || 'js'
    code = match[3] || ''
  }

  return {caption, lang, code}
})

exports.findMainDoclet = doclets => doclets.find(({name, longname, vueProto}) => name === longname || vueProto)

exports.extractVueProtoParts = doclets => {
  let protoDoclet = exports.findMainDoclet(doclets)

  let props = []
  let dataProps = []
  let compProps = []
  let otherMembers = []
  let methods = []
  let events = []

  doclets.forEach(child => {
    if (!exports.isPublic(child) || child.memberof !== protoDoclet.longname) {
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
