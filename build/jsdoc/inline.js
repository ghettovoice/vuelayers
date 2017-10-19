const inlineTag = require('jsdoc/lib/jsdoc/tag/inline')

exports.handlers = {
  newDoclet ({doclet}) {
    resolveDocletLink(doclet, {base: doclet.longname})
  },
}
exports.processDoclet = resolveDocletLink
exports.resolveExternals = resolveExternalIdents
exports.resolveLinks = resolveLinks

function resolveDocletLink (doclet, options) {
  const tags = options.tags || [
    'description',
    'see',
    'typeExpression',
  ]

  tags.forEach(tag => {
    if (!doclet.hasOwnProperty(tag)) {
      return
    }

    if (typeof doclet[tag] === 'string') {
      doclet[tag] = resolveLinks(resolveExternalIdents(doclet[tag], options), options)
    } else if (Array.isArray(doclet[tag])) {
      doclet[tag].forEach((value, index, original) => {
        let inner = {}

        inner[tag] = value
        resolveDocletLink(inner, options)
        original[index] = inner[tag]
      })
    } else if (doclet[tag]) {
      resolveDocletLink(doclet[tag], options)
    }
  })
}

function resolveExternalIdents (string, options) {
  return string.replace(/(ol\.[^\s])/.ig, '<a href="https://openlayers.org/en/latest/apidoc/$1.html">$1</a>')
}

function resolveLinks (string, options) {
  let replacers = {
    link: getLinkProcessor(options),
    linkcode: getLinkProcessor(options),
  }

  return inlineTag.replaceInlineTags(string, replacers).newString
}

// copy-paste from jsdoc/lib/jsdoc/util/templateHelper
// a bit adopted for Vue
function getLinkProcessor (options) {
  return function processLink (string, tagInfo) {
    const leading = extractLeadingText(string, tagInfo.completeTag)
    let linkText = leading.leadingText
    let monospace
    let split
    let target

    string = leading.string

    split = splitLinkText(tagInfo.text)
    target = split.target
    linkText = linkText || split.linkText
    monospace = useMonospace(tagInfo.tag, tagInfo.text)

    return string.replace(tagInfo.completeTag, buildLink(target, linkText, Object.assign(options, {
      monospace,
    })))
  }
}

function extractLeadingText (string, completeTag) {
  const tagIndex = string.indexOf(completeTag)
  let leadingText = null
  const leadingTextRegExp = /\[(.+?)\]/g
  let leadingTextInfo = leadingTextRegExp.exec(string)

  // did we find leading text, and if so, does it immediately precede the tag?
  while (leadingTextInfo && leadingTextInfo.length) {
    if (leadingTextInfo.index + leadingTextInfo[0].length === tagIndex) {
      string = string.replace(leadingTextInfo[0], '')
      leadingText = leadingTextInfo[1]
      break
    }

    leadingTextInfo = leadingTextRegExp.exec(string)
  }

  return {leadingText, string}
}

function buildLink (longname, linkText, options) {
  let fileUrl, text
  // handle cases like:
  // @see <http://example.org>
  // @see http://example.org
  longname = longname ? longname.replace(/^<|>$/g, '') : ''
  text = linkText || longname
  text = options.monospace ? '<code>' + text + '</code>' : text

  if (hasUrlPrefix(longname)) {
    fileUrl = longname

    return `<a href="${fileUrl}" target="_blank">${text}</a>`
  }
  // inner page link
  if (longname.indexOf(options.base) === 0) {
    let ident = longname.replace(/^module:/, '').replace('/', '-').toLowerCase()

    return `<a @click="scrollTo('${ident}')">${text}</a>`
  }
  // link to another doc page
  fileUrl = longname.replace(/^module:/, '').split('/')[0]

  return `<router-link to="${fileUrl}">${text}</router-link>`
}

function useMonospace (tag, text) {
  let result = false

  if (tag === 'linkplain') {
    result = false
  } else if (tag === 'linkcode') {
    result = true
  }

  return result || false
}

function hasUrlPrefix (text) {
  return (/^(http|ftp)s?:\/\//).test(text)
}

function splitLinkText (text) {
  let linkText
  let target
  let splitIndex

  // if a pipe is not present, we split on the first space
  splitIndex = text.indexOf('|')
  if (splitIndex === -1) {
    splitIndex = text.search(/\s/)
  }

  if (splitIndex !== -1) {
    linkText = text.substr(splitIndex + 1)
    // Normalize subsequent newlines to a single space.
    linkText = linkText.replace(/\n+/, ' ')
    target = text.substr(0, splitIndex)
  }

  return {
    linkText,
    target: target || text,
  }
}
