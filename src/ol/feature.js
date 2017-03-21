/**
 * Feature extensions
 */
import ol from 'openlayers'
import { omit, constant } from 'vl-utils/func'
import { MAP_PROJECTION } from './consts'
import geoJson from './geojson'

export const cleanProperties = omit([ 'geometry' ])

export default class Feature extends ol.Feature {
  get id () {
    return this.getId()
  }

  // noinspection JSMethodCanBeStatic
  get type () {
    return 'Feature'
  }

  get properties () {
    return cleanProperties(this.getProperties())
  }

  get geometry () {
    return this.getGeometry().plain
  }

  get plain () {
    return plain(this)
  }
}

/**
 * @param {GeoJSONFeature} geoJson
 * @param {ol.ProjectionLike|undefined} [featureProjection=EPSG:3857]
 * @return {ol.Feature}
 */
export function createFeature (geoJson = {}, featureProjection = MAP_PROJECTION) {
  return geoJson.readFeature({
    ...geoJson,
    type: 'Feature',
    properties: cleanProperties(geoJson.properties)
  }, { featureProjection })
}

/**
 * @param {ol.Feature} feature
 * @param {ol.ProjectionLike|undefined} [featureProjection=EPSG:3857]
 * @return {GeoJSONFeature}
 */
export function plain (feature, featureProjection = MAP_PROJECTION) {
  return geoJson.writeFeatureObject(feature, { featureProjection })
}
