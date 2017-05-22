import GeoJSON from 'ol/format/geojson'
import plainProps from '../utils/plain-props'
import { DATA_PROJECTION, MAP_PROJECTION } from './consts'

const geoJson = new GeoJSON({
  defaultDataProjection: DATA_PROJECTION
})

/**
 * @param {ol.Feature} feature
 * @param {ol.ProjectionLike|undefined} [featureProjection=EPSG:3857]
 * @param {ol.ProjectionLike|undefined} [dataProjection=EPSG:4326]
 * @return {GeoJSONFeature}
 */
export function writeFeature (feature, featureProjection = MAP_PROJECTION, dataProjection = DATA_PROJECTION) {
  return geoJson.writeFeatureObject(feature, { featureProjection, dataProjection })
}

/**
 * @param {GeoJSONFeature} geoJsonFeature
 * @param {ol.ProjectionLike|undefined} [featureProjection=EPSG:3857]
 * @param {ol.ProjectionLike|undefined} [dataProjection=EPSG:4326]
 * @return {ol.Feature}
 */
export function readFeature (geoJsonFeature, featureProjection = MAP_PROJECTION, dataProjection = DATA_PROJECTION) {
  return geoJson.readFeature({
    ...geoJsonFeature,
    type: 'Feature',
    properties: plainProps(geoJsonFeature.properties)
  }, { featureProjection, dataProjection })
}

/**
 * @param {ol.geom.Geometry} geometry
 * @param {ol.ProjectionLike|undefined} [geometryProjection=EPSG:3857]
 * @param {ol.ProjectionLike|undefined} [dataProjection=EPSG:4326]
 * @return {GeoJSONGeometry|GeoJSONGeometryCollection}
 */
export function writeGeometry (geometry, geometryProjection = MAP_PROJECTION, dataProjection = DATA_PROJECTION) {
  return geoJson.writeGeometryObject(geometry, {
    featureProjection: geometryProjection,
    dataProjection
  })
}

/**
 * @param {GeoJSONGeometry} geoJsonGeometry
 * @param {ol.ProjectionLike|undefined} [geometryProjection=EPSG:3857]
 * @param {ol.ProjectionLike|undefined} [dataProjection=EPSG:4326]
 * @return {ol.geom.Geometry}
 */
export function readGeometry (geoJsonGeometry, geometryProjection = MAP_PROJECTION, dataProjection = DATA_PROJECTION) {
  return geoJson.readGeometryFromObject(geoJsonGeometry, {
    featureProjection: geometryProjection,
    dataProjection
  })
}
