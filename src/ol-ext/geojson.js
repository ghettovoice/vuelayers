import Feature from 'ol/feature'
import { isPlainObject, get } from '../util/minilo'
import { createGeoJsonFmt } from './format'

const geoJsonFmt = createGeoJsonFmt()

/**
 * @param {ol.Feature} feature
 * @param {ol.ProjectionLike|undefined} [featureProjection]
 * @param {ol.ProjectionLike|undefined} [dataProjection]
 * @return {GeoJSONFeature|Object}
 */
export function writeGeoJsonFeature (feature, featureProjection, dataProjection) {
  const geoJsonFeature = geoJsonFmt.writeFeatureObject(feature, { featureProjection, resolvedDataProjection: dataProjection })

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
 * @param {GeoJSONFeature|Object} geoJsonFeature
 * @param {ol.ProjectionLike|undefined} [featureProjection]
 * @param {ol.ProjectionLike|undefined} [dataProjection]
 * @return {ol.Feature}
 */
export function readGeoJsonFeature (geoJsonFeature, featureProjection, dataProjection) {
  let feature = geoJsonFmt.readFeature(geoJsonFeature, { featureProjection, resolvedDataProjection: dataProjection })

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
 * @param {ol.geom.Geometry} geometry
 * @param {ol.ProjectionLike|undefined} [geometryProjection]
 * @param {ol.ProjectionLike|undefined} [dataProjection]
 * @return {GeoJSONGeometry|GeoJSONGeometryCollection|Object}
 */
export function writeGeoJsonGeometry (geometry, geometryProjection, dataProjection) {
  return geoJsonFmt.writeGeometryObject(geometry, {
    featureProjection: geometryProjection,
    resolvedDataProjection: dataProjection,
  })
}

/**
 * @param {GeoJSONGeometry|Object} geoJsonGeometry
 * @param {ol.ProjectionLike|undefined} [geometryProjection]
 * @param {ol.ProjectionLike|undefined} [dataProjection]
 * @return {ol.geom.Geometry}
 */
export function readGeoJsonGeometry (geoJsonGeometry, geometryProjection, dataProjection) {
  dataProjection = readProjection(geoJsonGeometry, dataProjection)

  return geoJsonFmt.readGeometry(geoJsonGeometry, {
    featureProjection: geometryProjection,
    resolvedDataProjection: dataProjection,
  })
}

export function readProjection (geoJsonObj, defaultProjection) {
  return geoJsonFmt.readProjection(geoJsonObj) || defaultProjection
}
