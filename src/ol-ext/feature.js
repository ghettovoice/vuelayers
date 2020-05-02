import { Feature } from 'ol'
import { v4 as uuid } from 'uuid'
import { isPlainObject, omit } from '../util/minilo'
import { CIRCLE_SERIALIZE_PROP, STYLE_SERIALIZE_PROP } from './format'

/**
 * @param {Object|module:ol/Feature~Feature|string|number} feature
 * @return {string|number}
 * @throws {Error}
 */
export function getFeatureId (feature) {
  if (feature instanceof Feature) {
    return feature.getId()
  } else if (isPlainObject(feature)) {
    return feature.id
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
  } else if (isPlainObject(feature)) {
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

export function getFeatureGeometryName (feature) {
  if (feature instanceof Feature) {
    return feature.getGeometryName()
  }
  return 'geometry'
}

export function getFeatureProperties (feature) {
  if (!feature) return

  return omit(
    feature instanceof Feature ? feature.getProperties() : feature.properties,
    [
      getFeatureGeometryName(feature),
      CIRCLE_SERIALIZE_PROP,
      STYLE_SERIALIZE_PROP,
    ],
  )
}

export function setFeatureProperties (feature, properties) {
  if (!feature) return

  properties = omit(properties, [
    getFeatureGeometryName(feature),
    CIRCLE_SERIALIZE_PROP,
    STYLE_SERIALIZE_PROP,
  ])

  if (feature instanceof Feature) {
    feature.setProperties(properties)
  } else {
    feature.properties = properties
  }
}
