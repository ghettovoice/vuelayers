import GeoJSON from 'ol/format/geojson'
import plainProps from 'vl-utils/plain-props'
import { DATA_PROJECTION, MAP_PROJECTION } from './consts'

const geoJson = new GeoJSON({
  defaultDataProjection: DATA_PROJECTION
})

/**
 * @param {ol.Feature} feature
 * @param {ol.ProjectionLike|undefined} [featureProjection=EPSG:3857]
 * @return {GeoJSONFeature}
 */
export function writeFeature (feature, featureProjection = MAP_PROJECTION) {
  return geoJson.writeFeatureObject(feature, { featureProjection })
}

/**
 * @param {GeoJSONFeature} geoJsonFeature
 * @param {ol.ProjectionLike|undefined} [featureProjection=EPSG:3857]
 * @return {ol.Feature}
 */
export function readFeature (geoJsonFeature, featureProjection = MAP_PROJECTION) {
  return geoJson.readFeature({
    ...geoJsonFeature,
    type: 'Feature',
    properties: plainProps(geoJsonFeature.properties)
  }, { featureProjection })
}

/**
 * @param {ol.geom.Geometry} geometry
 * @param {ol.ProjectionLike|undefined} [geometryProjection=EPSG:3857]
 * @return {GeoJSONGeometry|GeoJSONGeometryCollection}
 */
export function writeGeometry (geometry, geometryProjection = MAP_PROJECTION) {
  return geoJson.writeGeometryObject(geometry, {
    featureProjection: geometryProjection
  })
}

/**
 * @param {GeoJSONGeometry} geoJsonGeometry
 * @param {ol.ProjectionLike|undefined} [geometryProjection=EPSG:3857]
 * @return {ol.geom.Geometry}
 */
export function readGeometry (geoJsonGeometry, geometryProjection = MAP_PROJECTION) {
  return geoJson.readGeometryFromObject(geoJsonGeometry, {
    featureProjection: geometryProjection
  })
}
