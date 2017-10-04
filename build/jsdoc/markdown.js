const marked = require('marked')
const hljs = require('highlight.js')

exports.handlers = {
  newDoclet ({doclet}) {
    let mdOpts = markdownOptions()
    parseMarkdown(doclet, mdOpts)
  },
}

// todo move to options
function markdownOptions () {
  let renderer = new marked.Renderer()
  renderer.html = html => `<div class="content">${html}</div>`
  renderer.link = function (href, title, text) {
    let external = /^https?:\/\/.+$/.test(href)
    let hrefParts = href.split('|')
    href = hrefParts[0]
    let tag = hrefParts[1] || 'a'
    let target = external ? 'target="_blank"' : ''
    title = title ? `title="${title}"` : ''

    return `<${tag} href="${href}" ${title} ${target}>${text}</${tag}>`
  }

  return {
    breaks: false,
    langPrefix: 'hljs ',
    highlight: (code, lang) => lang ? hljs.highlight(lang, code).value : code,
    renderer,
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
    'summary',
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
