import { EPSG_3857, EPSG_4326 } from './consts'
import Feature from 'ol/Feature'
import { get, isPlainObject } from '../util/minilo'
import { createGeoJsonFmt } from './format'

const geoJsonFmt = createGeoJsonFmt()

/**
 * @param {Feature} feature
 * @param {ProjectionLike|undefined} [featureProjection=EPSG:3857]
 * @param {ProjectionLike|undefined} [dataProjection=EPSG:4326]
 * @return {Object}
 */
export function writeGeoJsonFeature (feature, featureProjection = EPSG_3857, dataProjection = EPSG_4326) {
  const geoJsonFeature = geoJsonFmt.writeFeatureObject(feature, { featureProjection, dataProjection })

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
 * @param {ProjectionLike|undefined} [featureProjection=EPSG:3857]
 * @param {ProjectionLike|undefined} [dataProjection=EPSG:4326]
 * @return {Feature}
 */
export function readGeoJsonFeature (geoJsonFeature, featureProjection = EPSG_3857, dataProjection = EPSG_4326) {
  let feature = geoJsonFmt.readFeature(geoJsonFeature, { featureProjection, dataProjection })

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
 * @param {ProjectionLike|undefined} [geometryProjection=EPSG:3857]
 * @param {ProjectionLike|undefined} [dataProjection=EPSG:4326]
 * @return {Object}
 */
export function writeGeoJsonGeometry (geometry, geometryProjection = EPSG_3857, dataProjection = EPSG_4326) {
  return geoJsonFmt.writeGeometryObject(geometry, {
    featureProjection: geometryProjection,
    dataProjection,
  })
}

/**
 * @param {Object|Object} geoJsonGeometry
 * @param {ProjectionLike|undefined} [geometryProjection=EPSG:3857]
 * @param {ProjectionLike|undefined} [dataProjection=EPSG:4326]
 * @return {Geometry}
 */
export function readGeoJsonGeometry (geoJsonGeometry, geometryProjection = EPSG_3857, dataProjection = EPSG_4326) {
  dataProjection = readProjection(geoJsonGeometry, dataProjection)

  return geoJsonFmt.readGeometry(geoJsonGeometry, {
    featureProjection: geometryProjection,
    dataProjection,
  })
}

export function readProjection (geoJsonObj, defaultProjection) {
  return geoJsonFmt.readProjection(geoJsonObj) || defaultProjection
}
