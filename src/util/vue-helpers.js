/**
 * Constructs watch hash for multiple properties.
 * @param {string[]} props
 * @param {function|Object} watcher
 */
export function makeWatchers (props, watcher) {
  return props.reduce((hash, prop) => {
    hash[prop] = watcher
    return hash
  }, {})
}
