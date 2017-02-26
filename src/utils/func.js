/**
 * @param {*} value
 * @return {boolean} True if value is number or numeric string.
 */
export function isNumeric (value) {
  return !isNaN(parseFloat(value)) && isFinite(value)
}

/**
 * @param {...*} [args]
 *
 * @return {*}
 */
export function coalesce (...args) {
  return args.find(val => val != null)
}

/**
 * @param {number} num
 * @param {number} [precision=0]
 * @return {number}
 */
export function round (num, precision = 0) {
  return Number(Math.round(Number(num + 'e+' + precision)) + 'e-' + precision)
}

/**
 * Replaces `tokens` in the `string` by values from the `replaces`.
 *
 * @param {string} string
 * @param {Object} replaces
 *
 * @returns {string}
 */
export function replaceTokens (string, replaces) {
  const regExp = new RegExp(Object.keys(replaces).map(field => '(\\{' + field + '\\})').join('|'), 'ig')

  return string.replace(regExp, match => replaces[ match.substr(1, match.length - 2) ] || '')
}

