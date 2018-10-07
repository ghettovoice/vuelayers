import Feature from 'ol/Feature'
/** @module ol-ext/feature */
import uuid from 'uuid/v4'
import Vue from 'vue'
import { isNumber, isPlainObject, isString } from '../util/minilo'

/**
 * Basic feature initialization
 * @param feature
 */
export function initFeature (feature) {
  if (feature.getId() == null) {
    feature.setId(uuid())
  }

  return feature
}

/**
 * @param {Object|Vue|Feature|string|number} feature
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
