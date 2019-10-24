import GeometryType from 'ol/geom/GeometryType'
import { isArray, isFunction, isPlainObject, reduce } from '../util/minilo'

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

/**
 * @param {Object} feature
 * @returns {boolean}
 */
export function isGeoJSONFeature (feature) {
  return isPlainObject(feature) && feature.type === 'Feature' &&
    isPlainObject(feature.geometry) &&
    Object.values(GeometryType).includes(feature.geometry.type) &&
    isArray(feature.geometry.coordinates)
}

export function cleanSourceParams (params, filterKeys) {
  return reduce(params, (params, value, key) => {
    key = key.toUpperCase()
    if (filterKeys.includes(key)) {
      return params
    }

    params[key] = value

    return params
  }, {})
}
