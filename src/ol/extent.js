/**
 * Extent extensions
 */
import { transformExtent } from 'ol/proj'
import { MAP_PROJECTION, DATA_PROJECTION } from './consts'

/**
 * @param {Extent} extent
 * @param {ProjectionLike} projection
 * @return {Extent}
 */
export function fromLonLat (extent, projection = MAP_PROJECTION) {
  return transformExtent(extent, DATA_PROJECTION, projection)
}

/**
 * @param {Extent} extent
 * @param {ProjectionLike} projection
 * @return {Extent}
 */
export function toLonLat (extent, projection = MAP_PROJECTION) {
  return transformExtent(extent, projection, DATA_PROJECTION)
}
