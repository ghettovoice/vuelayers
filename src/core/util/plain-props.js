import { isBoolean, isNumber, isPlainObject, isString, pickBy } from 'lodash/fp'
/**
 * @func
 * @param {Object} value
 * @param {Object} Returns object only with plain properties.
 */
export default pickBy(function (x) {
  return isNumber(x) || isString(x) || Array.isArray(x) || isBoolean(x) || isPlainObject(x)
})
