const { escape } = require('lodash/fp')

exports.nameToIdent = string => string.replace(/^module:/, '').replace('/', '-').toLowerCase()

exports.isPublic = ({access, undocumented}) => !undocumented && (!access || access === 'public')

exports.alphabetSorter = (a, b) => {
  return a.name.toLowerCase() === b.name.toLowerCase()
    ? 0
    : (
      a.name.toLowerCase() < b.name.toLowerCase()
        ? -1
        : 1
    )
}

exports.mapExamples = examples => (examples || []).map(function (example) {
  let caption, code
  let lang = ''
  let match = example.match(/^\s*(?:<caption>)?([^[\]\n\r]+?)?(?:<\/caption>)?(?:\s*\[([\w]*)])?[\n\r]([\s\S]+)$/i)

  if (match) {
    caption = match[1] || 'Example'
    lang = match[2] || ''
    code = match[3] || ''
  }

  return `<vld-code class="example" title="${caption}" lang="${lang}">${escape(code)}</vld-code>`
})

exports.mapVueExamples = examples => (examples || []).map(function (example) {
  let caption, code, lang = ''
  let match = example.match(/^\s*(?:<caption>)?([^[\]\n\r]+?)?(?:<\/caption>)?(?:\s*\[([\w]*)])?[\n\r]([\s\S]+)$/i)

  if (match) {
    caption = match[1] || 'Example'
    lang = match[2] || ''
    code = match[3] || ''
  }

  return `
<div class="example">
  <b class="title">${caption}</b>
  <b-tabs>
    <b-tab-item label="Source">
      <vld-code lang="${lang}">${escape(code)}</vld-code>
    </b-tab-item>
    <b-tab-item label="Result">
      ${code}
    </b-tab-item>
  </b-tabs>
</div>`
})

exports.findVueProtoParts = (doclets, protoDoclet) => {
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
    switch (true) {
      case child.vueProp:
        props.push(child)
        break
      case child.vueComputedProp:
        compProps.push(child)
        break
      case child.vueDataProp:
        dataProps.push(child)
        break
      case child.kind === 'member' && child.scope === 'instance':
        otherMembers.push(child)
        break
      case child.vueMethod:
        methods.push(child)
        break
      case child.kind === 'event':
        events.push(child)
        break
    }
  })
  props.sort(exports.alphabetSorter)
  compProps.sort(exports.alphabetSorter)
  dataProps.sort(exports.alphabetSorter)
  otherMembers.sort(exports.alphabetSorter)
  methods.sort(exports.alphabetSorter)
  events.sort(exports.alphabetSorter)

  return {
    props,
    compProps,
    dataProps,
    otherMembers,
    methods,
    events,
  }
}
