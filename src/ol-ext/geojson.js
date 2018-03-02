import { get } from 'lodash-es'
import Feature from 'ol/feature'
import { isPlainObject } from '../util/minilo'
import { geoJson as geoJsonFactory } from './format'

const geoJson = geoJsonFactory()

/**
 * @param {ol.Feature} feature
 * @param {ol.ProjectionLike|undefined} [featureProjection]
 * @param {ol.ProjectionLike|undefined} [dataProjection]
 * @return {GeoJSONFeature|Object}
 */
export function writeFeature (feature, featureProjection, dataProjection) {
  const geoJsonFeature = geoJson.writeFeatureObject(feature, { featureProjection, dataProjection })

  if (Array.isArray(get(geoJsonFeature, 'properties.features'))) {
    geoJsonFeature.properties.features = geoJsonFeature.properties.features.map(feature => {
      if (feature instanceof Feature) {
        return writeFeature(feature, featureProjection, dataProjection)
      }
      return feature
    })
  }

  return geoJsonFeature
}

/**
 * @param {GeoJSONFeature|Object} geoJsonFeature
 * @param {ol.ProjectionLike|undefined} [featureProjection]
 * @param {ol.ProjectionLike|undefined} [dataProjection]
 * @return {ol.Feature}
 */
export function readFeature (geoJsonFeature, featureProjection, dataProjection) {
  let feature = geoJson.readFeature(geoJsonFeature, { featureProjection, dataProjection })

  if (Array.isArray(feature.get('features'))) {
    feature.set('features', feature.get('features').map(feature => {
      if (isPlainObject(feature)) {
        return readFeature(feature, featureProjection, dataProjection)
      }
      return feature
    }))
  }

  return feature
}

/**
 * @param {ol.geom.Geometry} geometry
 * @param {ol.ProjectionLike|undefined} [geometryProjection]
 * @param {ol.ProjectionLike|undefined} [dataProjection]
 * @return {GeoJSONGeometry|GeoJSONGeometryCollection|Object}
 */
export function writeGeometry (geometry, geometryProjection, dataProjection) {
  return geoJson.writeGeometryObject(geometry, {
    featureProjection: geometryProjection,
    dataProjection,
  })
}

/**
 * @param {GeoJSONGeometry|Object} geoJsonGeometry
 * @param {ol.ProjectionLike|undefined} [geometryProjection]
 * @param {ol.ProjectionLike|undefined} [dataProjection]
 * @return {ol.geom.Geometry}
 */
export function readGeometry (geoJsonGeometry, geometryProjection, dataProjection) {
  dataProjection = readProjection(geoJsonGeometry, dataProjection)

  return geoJson.readGeometry(geoJsonGeometry, {
    featureProjection: geometryProjection,
    dataProjection,
  })
}

export function readProjection (geoJsonObj, defaultProjection) {
  return geoJson.readProjection(geoJsonObj) || defaultProjection
}
