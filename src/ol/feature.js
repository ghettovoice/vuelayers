import ol from 'openlayers'
import { omit } from 'lodash/fp'
import { MAP_PROJECTION } from './consts'

const geoJsonFormat = new ol.format.GeoJSON()

export function createFeature (geoJson = {}, featureProjection = MAP_PROJECTION) {
  const feature = geoJsonFormat.readFeature({
    ...geoJson,
    type: 'Feature',
    properties: omit([ 'geometry' ], geoJson.properties || {})
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
