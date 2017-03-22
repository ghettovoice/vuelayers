/**
 * OpenLayers extensions
 */
import tilegrid from 'ol/tilegrid'

export * as consts from './consts'
export * as styleHelper from './style'
export * as extentHelper from './extent'
export * as coordinateHelper from './coordinate'
export * as geoJson from './geojson'

// emulate standalone openlayers package for ol-tilecache
export default {
  tilegrid
}
