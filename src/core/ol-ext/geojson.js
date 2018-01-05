import Feature from 'ol/feature'
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

  if (geoJsonFeature.properties && geoJsonFeature.properties.features) {
    geoJsonFeature.properties.features = geoJsonFeature.properties.features.map(f => {
      if (f instanceof Feature) {
        return writeFeature(f, featureProjection, dataProjection)
      }

      return f
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
  dataProjection = readProjection(geoJsonFeature, dataProjection)

  return geoJson.readFeature(geoJsonFeature, { featureProjection, dataProjection })
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
