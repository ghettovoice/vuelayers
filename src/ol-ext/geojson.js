import Feature from 'ol/Feature'
import { get, isPlainObject } from '../util/minilo'
import { createGeoJsonFmt } from './format'

const geoJsonFmt = createGeoJsonFmt()

/**
 * @param {Feature} feature
 * @param {ProjectionLike|undefined} [featureProjection]
 * @param {ProjectionLike|undefined} [dataProjection]
 * @return {Object}
 */
export function writeGeoJsonFeature (feature, featureProjection, dataProjection) {
  const geoJsonFeature = geoJsonFmt.writeFeatureObject(feature, { featureProjection, dataProjection: dataProjection })

  if (Array.isArray(get(geoJsonFeature, 'properties.features'))) {
    geoJsonFeature.properties.features = geoJsonFeature.properties.features.map(feature => {
      if (feature instanceof Feature) {
        return writeGeoJsonFeature(feature, featureProjection, dataProjection)
      }
      return feature
    })
  }

  return geoJsonFeature
}

/**
 * @param {Object} geoJsonFeature
 * @param {ProjectionLike|undefined} [featureProjection]
 * @param {ProjectionLike|undefined} [dataProjection]
 * @return {Feature}
 */
export function readGeoJsonFeature (geoJsonFeature, featureProjection, dataProjection) {
  let feature = geoJsonFmt.readFeature(geoJsonFeature, { featureProjection, dataProjection: dataProjection })

  if (Array.isArray(feature.get('features'))) {
    feature.set('features', feature.get('features').map(feature => {
      if (isPlainObject(feature)) {
        return readGeoJsonFeature(feature, featureProjection, dataProjection)
      }
      return feature
    }))
  }

  return feature
}

/**
 * @param {Geometry} geometry
 * @param {ProjectionLike|undefined} [geometryProjection]
 * @param {ProjectionLike|undefined} [dataProjection]
 * @return {Object}
 */
export function writeGeoJsonGeometry (geometry, geometryProjection, dataProjection) {
  return geoJsonFmt.writeGeometryObject(geometry, {
    featureProjection: geometryProjection,
    dataProjection,
  })
}

/**
 * @param {Object|Object} geoJsonGeometry
 * @param {ProjectionLike|undefined} [geometryProjection]
 * @param {ProjectionLike|undefined} [dataProjection]
 * @return {Geometry}
 */
export function readGeoJsonGeometry (geoJsonGeometry, geometryProjection, dataProjection) {
  dataProjection = readProjection(geoJsonGeometry, dataProjection)

  return geoJsonFmt.readGeometry(geoJsonGeometry, {
    featureProjection: geometryProjection,
    dataProjection,
  })
}

export function readProjection (geoJsonObj, defaultProjection) {
  return geoJsonFmt.readProjection(geoJsonObj) || defaultProjection
}
