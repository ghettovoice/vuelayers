/** @module ol-ext/util */
import { isFunction } from '../util/minilo'

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
