import ol from 'openlayers'
import { omit, constant } from 'vl-utils/func'
import { MAP_PROJECTION, DATA_PROJECTION } from './consts'

const geoJsonFormat = new ol.format.GeoJSON({
  defaultDataProjection: DATA_PROJECTION
})

export const cleanProperties = omit([ 'geometry' ])

/**
 * @param {GeoJSONFeature} geoJson
 * @param {ol.ProjectionLike|undefined} [featureProjection=EPSG:3857]
 * @return {ol.Feature}
 */
export function createFeature (geoJson = {}, featureProjection = MAP_PROJECTION) {
  const feature = geoJsonFormat.readFeature({
    ...geoJson,
    type: 'Feature',
    properties: cleanProperties(geoJson.properties || {})
  }, { featureProjection })

  return Object.defineProperties(feature, {
    id: {
      get () {
        return this.getId()
      }
    },
    type: {
      get: constant('Feature')
    },
    properties: {
      get () {
        return cleanProperties(this.getProperties())
      }
    },
    geometry: {
      get () {
        return this.getGeometry().plain
      }
    },
    plain: {
      get () {
        return plainFeature(this, featureProjection)
      }
    }
  })
}

/**
 * @param {ol.Feature} feature
 * @param {ol.ProjectionLike|undefined} [featureProjection=EPSG:3857]
 * @return {GeoJSONFeature}
 */
export function plainFeature (feature, featureProjection = MAP_PROJECTION) {
  return geoJsonFormat.writeFeatureObject(feature, { featureProjection })
}
