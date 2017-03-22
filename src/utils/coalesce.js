/**
 * @param {...*} [args]
 *
 * @return {*}
 */
export default function coalesce (...args) {
  return args.find(val => val != null)
}
