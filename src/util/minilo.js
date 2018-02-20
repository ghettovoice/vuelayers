/**
 * Mini Lodash.
 * @module util/minilo
 */
const objectProto = Object.prototype
const arrayProto = Array.prototype

export function toString(value) {
  return value::objectProto.toString()
}

export function toArray (value) {
  return value::arrayProto.slice()
}

export function isBoolean (value) {
  return value::objectProto.toString() === '[object Boolean]'
}

export function isNumber (value) {
  return value::objectProto.toString() === '[object Number]'
}

export function isString (value) {
  return value::objectProto.toString() === '[object String]'
}

export function isArray (value) {
  return Array.isArray(value)
}

/**
 * @param {*} value
 * @return {boolean} True if value is number or numeric string.
 */
export function isNumeric (value) {
  return !isNaN(parseFloat(value)) && isFinite(value)
}

export function isObjectLike(value) {
  return value != null && typeof value === 'object'
}

export function isPlainObject (value) {
  return isObjectLike(value) &&
    value::objectProto.toString() === '[object Object]' &&
    value.prototype == null
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
 * @func
 * @param {Object} object
 * @param {Object} Returns object only with plain properties.
 */
export function plainProps (object) {
  let newObject = {}
  let isPlain = x => isNumeric(x) || isArray(x) || isBoolean(x) || isPlainObject(x)
  Object.keys(object).forEach(key => {
    if (isPlain(object[key])) {
      newObject[key] = object[key]
    }
  })
  return newObject
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

  return string.replace(regExp, match => replaces[match.substr(1, match.length - 2)] || '')
}
