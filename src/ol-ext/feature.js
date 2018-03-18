import uuid from 'uuid/v4'
import Vue from 'vue'
import { isPlainObject, isString, isNumber } from '../util/minilo'
import Feature from 'ol/feature'

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
 * @param {GeoJSONFeature|Vue|ol.Feature|string|number} feature
 * @return {string|number}
 * @throws {Error}
 */
export function getId (feature) {
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
