import Feature from 'ol/Feature'
import uuid from 'uuid/v4'
import Vue from 'vue'
import { isNumber, isPlainObject, isString } from '../util/minilo'

/**
 * Basic feature initialization
 * @param {Object|Vue|module:ol/Feature~Feature} feature
 */
export function identifyFeature (feature) {
  if (isPlainObject(feature) || feature instanceof Vue) {
    if (feature.id == null) {
      feature.id = uuid()
    }
  } else if (feature instanceof Feature) {
    if (feature.getId() == null) {
      feature.setId(uuid())
    }
  } else {
    throw new Error('Illegal feature format')
  }

  return feature
}

/**
 * @param {Object|Vue|module:ol/Feature~Feature|string|number} feature
 * @return {string|number}
 * @throws {Error}
 */
export function getFeatureId (feature) {
  let id
  if (isPlainObject(feature) || feature instanceof Vue) {
    id = feature.id
  } else if (feature instanceof Feature) {
    id = feature.getId()
  } else if (isString(feature) || isNumber(feature)) {
    id = feature
  } else {
    throw new Error('Illegal feature format')
  }

  return id
}
