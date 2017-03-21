/**
 * Extent extensions
 */
import ol from 'openlayers'
import { MAP_PROJECTION, DATA_PROJECTION } from './consts'

/**
 * @param {ol.Extent} extent
 * @param {ol.ProjectionLike} projection
 * @return {ol.Extent}
 */
export function fromLonLat (extent, projection = MAP_PROJECTION) {
  return ol.proj.transformExtent(extent, DATA_PROJECTION, projection)
}

/**
 * @param {ol.Extent} extent
 * @param {ol.ProjectionLike} projection
 * @return {ol.Extent}
 */
export function toLonLat (extent, projection = MAP_PROJECTION) {
  return ol.proj.transformExtent(extent, projection, DATA_PROJECTION)
}
