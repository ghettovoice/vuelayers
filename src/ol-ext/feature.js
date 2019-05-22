import Feature from 'ol/Feature'
import uuid from 'uuid/v4'
import Vue from 'vue'
import { isNumber, isPlainObject, isString } from '../util/minilo'

/**
 * @param {Object|Vue|Feature|string|number} feature
 * @return {string|number}
 * @throws {Error}
 */
export function getFeatureId (feature) {
  if (isPlainObject(feature) || feature instanceof Vue) {
    return feature.id
  } else if (feature instanceof Feature) {
    return feature.getId()
  } else if (isString(feature) || isNumber(feature)) {
    return feature
  }

  throw new Error('Illegal feature format')
}

/**
 * @param {Feature|Vue|Object} feature
 * @param {string} featureId
 * @returns {Feature|Vue|Object}
 */
export function setFeatureId (feature, featureId) {
  if (isPlainObject(feature) || feature instanceof Vue) {
    feature.id = featureId

    return feature
  } else if (feature instanceof Feature) {
    feature.setId(featureId)

    return feature
  }

  throw new Error('Illegal feature format')
}

/**
 * @param {Feature} feature
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
 * @param {Feature} destFeature
 * @param {Feature} srcFeature
 * @returns {Feature}
 */
export function mergeFeatures (destFeature, srcFeature) {
  destFeature.setProperties({ ...srcFeature.getProperties() })
  destFeature.setGeometry(srcFeature.getGeometry().clone())
  destFeature.setStyle(srcFeature.getStyle() != null ? srcFeature.getStyle().clone() : undefined)

  return destFeature
}
