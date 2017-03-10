import ol from 'openlayers'
import { omit } from 'vl-utils/func'
import { MAP_PROJECTION } from './consts'

const geoJsonFormat = new ol.format.GeoJSON()

export const cleanProperties = omit([ 'geometry' ])

export function createFeature (geoJson = {}, featureProjection = MAP_PROJECTION) {
  const feature = geoJsonFormat.readFeature({
    ...geoJson,
    type: 'Feature',
    properties: cleanProperties(geoJson.properties || {})
  }, {
    featureProjection: MAP_PROJECTION
  })
  feature.plain = function (featureProjection = MAP_PROJECTION) {
    return plainFeature(this, featureProjection)
  }

  return feature
}

export function plainFeature (feature, featureProjection = MAP_PROJECTION) {
  return geoJsonFormat.writeFeatureObject(feature, {
    featureProjection: featureProjection
  })
}
