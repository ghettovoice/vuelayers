/**
 * Extent extensions
 */
import {
  boundingExtent,
  getBottomLeft,
  getBottomRight,
  getCenter as getExtentCenter,
  getHeight as getExtentHeight,
  getTopLeft,
  getTopRight,
  getWidth as getExtentWidth,
} from 'ol/extent'
import { get as getProj } from 'ol/proj'
import { METERS_PER_UNIT } from 'ol/proj/Units'
import { EXTENT_CORNER, PROJ_UNIT } from './consts'

export {
  getExtentCenter,
  getExtentWidth,
  getExtentHeight,
  boundingExtent,
}

/**
 * Create a new extent or update the provided extent.
 * @param {number} minX Minimum X.
 * @param {number} minY Minimum Y.
 * @param {number} maxX Maximum X.
 * @param {number} maxY Maximum Y.
 * @param {Extent=} extent Destination extent.
 * @return {Extent} Extent.
 * @see https://github.com/openlayers/openlayers/blob/master/src/ol/extent.js#L208
 */
export function createOrUpdateExtent (minX, minY, maxX, maxY, extent) {
  if (extent) {
    extent[0] = minX
    extent[1] = minY
    extent[2] = maxX
    extent[3] = maxY

    return extent
  } else {
    return [minX, minY, maxX, maxY]
  }
}

/**
 * Get a corner coordinate of an extent.
 * @param {Extent|number[]} extent Extent.
 * @param {string} corner Corner.
 * @return {Coordinate} Corner coordinate.
 * @see https://github.com/openlayers/openlayers/blob/master/src/ol/extent.js#L482
 */
export function getExtentCorner (extent, corner) {
  let coordinate
  if (corner === EXTENT_CORNER.BOTTOM_LEFT) {
    coordinate = getBottomLeft(extent)
  } else if (corner === EXTENT_CORNER.BOTTOM_RIGHT) {
    coordinate = getBottomRight(extent)
  } else if (corner === EXTENT_CORNER.TOP_LEFT) {
    coordinate = getTopLeft(extent)
  } else if (corner === EXTENT_CORNER.TOP_RIGHT) {
    coordinate = getTopRight(extent)
  } else {
    throw new Error('Invalid corner')
  }
  return coordinate
}

/**
 * Generate a tile grid extent from a projection.  If the projection has an
 * extent, it is used.  If not, a global extent is assumed.
 * @param {Projection} projection Projection.
 * @return {Extent} Extent.
 * @see https://github.com/openlayers/openlayers/blob/master/src/ol/tilegrid.js#L148
 */
export function createExtentFromProjection (projection) {
  projection = getProj(projection)
  let extent = projection.getExtent()

  if (!extent) {
    let half = 180 * METERS_PER_UNIT[PROJ_UNIT.DEGREES] /
      projection.getMetersPerUnit()
    extent = createOrUpdateExtent(-half, -half, half, half)
  }
  return extent
}
