export * from './control'
export * from './coord'
export * from './extent'
export * from './feature'
export * from './format'
export * from './geom'
export * from './interaction'
export * from './layer'
export * from './map'
export * from './overlay'
export * from './proj'
export * from './source'
export * from './style'
export * from './tilegrid'
export * from './view'

export function expandUrl (url) {
  const urls = []
  let match = /\{([a-z])-([a-z])\}/.exec(url)
  if (match) {
    // char range
    const startCharCode = match[1].charCodeAt(0)
    const stopCharCode = match[2].charCodeAt(0)
    let charCode
    for (charCode = startCharCode; charCode <= stopCharCode; ++charCode) {
      urls.push(url.replace(match[0], String.fromCharCode(charCode)))
    }
    return urls
  }
  match = /\{(\d+)-(\d+)\}/.exec(url)
  if (match) {
    // number range
    const stop1 = parseInt(match[2], 10)
    for (let i = parseInt(match[1], 10); i <= stop1; i++) {
      urls.push(url.replace(match[0], i.toString()))
    }
    return urls
  }
  urls.push(url)
  return urls
}
