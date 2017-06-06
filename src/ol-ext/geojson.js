import GeoJSON from 'ol/format/geojson'
import plainProps from '../utils/plain-props'
import { EPSG_4326, EPSG_3857 } from './consts'

const geoJson = new GeoJSON()

/**
 * @param {ol.Feature} feature
 * @param {ol.ProjectionLike|undefined} [featureProjection=EPSG:3857]
 * @param {ol.ProjectionLike|undefined} [dataProjection=EPSG:4326]
 * @return {GeoJSONFeature|Object}
 */
export function writeFeature (feature, featureProjection = EPSG_3857, dataProjection = EPSG_4326) {
  return geoJson.writeFeatureObject(feature, { featureProjection, dataProjection })
}

/**
 * @param {GeoJSONFeature|Object} geoJsonFeature
 * @param {ol.ProjectionLike|undefined} [featureProjection=EPSG:3857]
 * @param {ol.ProjectionLike|undefined} [dataProjection=EPSG:4326]
 * @return {ol.Feature}
 */
export function readFeature (geoJsonFeature, featureProjection = EPSG_3857, dataProjection = EPSG_4326) {
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
 * @return {GeoJSONGeometry|GeoJSONGeometryCollection|Object}
 */
export function writeGeometry (geometry, geometryProjection = EPSG_3857, dataProjection = EPSG_4326) {
  return geoJson.writeGeometryObject(geometry, {
    featureProjection: geometryProjection,
    dataProjection
  })
}

/**
 * @param {GeoJSONGeometry|Object} geoJsonGeometry
 * @param {ol.ProjectionLike|undefined} [geometryProjection=EPSG:3857]
 * @param {ol.ProjectionLike|undefined} [dataProjection=EPSG:4326]
 * @return {ol.geom.Geometry}
 */
export function readGeometry (geoJsonGeometry, geometryProjection = EPSG_3857, dataProjection = EPSG_4326) {
  return geoJson.readGeometry(geoJsonGeometry, {
    featureProjection: geometryProjection,
    dataProjection
  })
}
