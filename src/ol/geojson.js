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
    properties: plainProps(geoJson.properties)
  }, { featureProjection })
}
