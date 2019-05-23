import { getUid } from 'ol'
import { isFunction, reduce } from '../util/minilo'

export function getObjectUid (object) {
  return getUid(object)
}

/**
 * heuristic check that value is ol collection
 * @param value
 * @return {boolean}
 */
export function isCollection (value) {
  return value && isFunction(value.getArray)
}

/**
 * heuristic check that value is ol vector source
 * @param value
 * @return {*}
 */
export function isVectorSource (value) {
  return value && isFunction(value.getAttributions) && isFunction(value.getFeatureById)
}

/**
 * @param value
 * @return {*}
 */
export function isCircle (value) {
  return isFunction(value.getCenter) && isFunction(value.getRadius)
}

export function cleanSourceExtraParams (params, filterKeys) {
  return reduce(params, (params, value, key) => {
    key = key.toUpperCase()
    if (filterKeys.includes(key)) {
      return params
    }

    params[key] = value

    return params
  }, {})
}
