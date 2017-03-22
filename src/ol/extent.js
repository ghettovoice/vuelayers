/**
 * Extent extensions
 */
import proj from 'ol/proj'
import { MAP_PROJECTION, DATA_PROJECTION } from './consts'

const { transformExtent } = proj

export {
  transformExtent as transform
}

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
