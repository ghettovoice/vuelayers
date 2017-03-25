import GeoJSON from 'ol/format/geojson'
import { DATA_PROJECTION, MAP_PROJECTION } from './consts'
import { isPlainObject, isObject } from 'lodash/fp'
const omitBy = require('lodash/fp/omitBy').convert({ cap: false })

const geoJson = new GeoJSON({
  defaultDataProjection: DATA_PROJECTION
})

export const cleanProperties = omitBy(x => isObject(x) && !isPlainObject(x))

/**
 * @param {ol.Feature} feature
 * @param {ol.ProjectionLike|undefined} [featureProjection=EPSG:3857]
 * @return {GeoJSONFeature}
 */
export function write (feature, featureProjection = MAP_PROJECTION) {
  return geoJson.writeFeatureObject(feature, { featureProjection })
}

/**
 * @param {GeoJSONFeature} geoJsonFeature
 * @param {ol.ProjectionLike|undefined} [featureProjection=EPSG:3857]
 * @return {ol.Feature}
 */
export function read (geoJsonFeature, featureProjection = MAP_PROJECTION) {
  return geoJson.readFeature({
    ...geoJsonFeature,
    type: 'Feature',
    properties: cleanProperties(geoJson.properties)
  }, { featureProjection })
}
