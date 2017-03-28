import { isPlainObject, isObject, omitBy } from 'lodash/fp'
/**
 * @func
 * @param {Object} value
 * @param {Object} Returns object only with plain properties.
 */
const plainProps = omitBy(x => isObject(x) && !isPlainObject(x))
export default plainProps
