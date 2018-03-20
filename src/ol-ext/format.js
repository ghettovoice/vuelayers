import GeoJSON from 'ol/format/geojson'
import TopoJSON from 'ol/format/topojson'

/**
 * @param {olx.format.GeoJSONOptions} [options]
 * @return {ol.format.GeoJSON}
 */
export function createGeoJsonFmt (options) {
  return new GeoJSON(options)
}

/**
 * @param {olx.format.TopoJSONOptions} [options]
 * @return {ol.format.TopoJSON}
 */
export function createTopoJsonFmt (options) {
  return new TopoJSON(options)
}
