/**
 * @param {...*} [args]
 *
 * @return {*}
 */
export default function coalesce (...args) {
  return args.filter(val => val != null).shift()
}
