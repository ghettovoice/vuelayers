import { Feature } from 'ol'
import { v4 as uuid } from 'uuid'
import { hasProp, isNumber, isString } from '../util/minilo'

/**
 * @param {Object|module:ol/Feature~Feature|string|number} feature
 * @return {string|number}
 * @throws {Error}
 */
export function getFeatureId (feature) {
  if (feature instanceof Feature) {
    return feature.getId()
  } else if (hasProp(feature, 'id')) {
    return feature.id
  } else if (isString(feature) || isNumber(feature)) {
    return feature
  }

  throw new Error('Illegal feature format')
}

/**
 * @param {module:ol/Feature~Feature|Object} feature
 * @param {string} featureId
 * @returns {module:ol/Feature~Feature|Object}
 */
export function setFeatureId (feature, featureId) {
  if (feature instanceof Feature) {
    feature.setId(featureId)

    return feature
  } else if (hasProp(feature, 'id')) {
    feature.id = featureId

    return feature
  }

  throw new Error('Illegal feature format')
}

/**
 * @param {module:ol/Feature~Feature} feature
 * @param {string|undefined} defaultFeatureId
 * @returns {Feature}
 */
export function initializeFeature (feature, defaultFeatureId) {
  if (getFeatureId(feature) == null) {
    setFeatureId(feature, defaultFeatureId || uuid())
  }

  return feature
}

/**
 * @param {module:ol/Feature~Feature} destFeature
 * @param {module:ol/Feature~Feature} srcFeature
 * @returns {module:ol/Feature~Feature}
 */
export function mergeFeatures (destFeature, srcFeature) {
  destFeature.setProperties({ ...srcFeature.getProperties() })
  destFeature.setGeometry(srcFeature.getGeometry().clone())
  destFeature.setStyle(srcFeature.getStyle() != null ? srcFeature.getStyle().clone() : undefined)

  return destFeature
}
