import ol from 'openlayers'
import { DATA_PROJECTION } from './consts'

const geoJson = new ol.format.GeoJSON({
  defaultDataProjection: DATA_PROJECTION
})

export default geoJson

