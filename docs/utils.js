export const routerViewProxy = (PageCmp, ContentCmp) => ({
  name: 'vld-router-view-proxy',
  functional: true,
  render (h, { props }) {
    return h(PageCmp, { props }, [h(ContentCmp, { props })])
  },
})

export function extractScript (src) {
  let match = src.match(/<script[^>]*>([\s\S]*)<\/script>/)

  return match ? match[1] : ''
}

export function extractTemplate (src) {
  let match = src.match(/<template[^>]*>([\s\S]*)<\/template>/)

  return match ? match[1] : ''
}

export function extractStyle (src) {
  let match = src.match(/<style[^>]*>([\s\S]*)<\/style>/)

  return match ? match[1] : ''
}

export function preFilter (text) {
  if (!text) return

  // Remove first blank line
  text = text.replace(/^\s*[\r\n]/g, '')

  // Find how many whitespaces before the first character of the first line
  const whitespaces = /^[ \t]*./.exec(text).toString().slice(0, -1)

  // Replace first occurrance of whitespace on each line
  let newText = []
  text.split(/\r\n|\r|\n/).forEach((line) => {
    newText.push(line.replace(whitespaces, ''))
  })
  newText = newText.join('\r\n')

  return newText
}

export function alphabetSorter (a, b) {
  return a.name.toLowerCase() === b.name.toLowerCase() ? 0 : (
    a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
  )
}
