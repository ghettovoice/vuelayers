import baseMergeDescriptors from 'merge-descriptors'

/**
 * @param {...Object} args
 * @returns {Object}
 */
export default function mergeDescriptors (...args) {
  let redefine
  if (typeof args[args.length - 1] !== 'object') {
    redefine = args.pop()
  }

  return args.slice(1).reduce(
    (dest, src, i) => baseMergeDescriptors(dest, src, redefine),
    args[0],
  )
}
