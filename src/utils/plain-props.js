import { pickBy, isNumber, isString, isBoolean, isPlainObject } from 'lodash/fp'
/**
 * @func
 * @param {Object} value
 * @param {Object} Returns object only with plain properties.
 */
const plainProps = pickBy(x => isNumber(x) ||
                               isString(x) ||
                               Array.isArray(x) ||
                               isBoolean(x) ||
                               isPlainObject(x))
export default plainProps
