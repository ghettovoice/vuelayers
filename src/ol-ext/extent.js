/**
 * Extent extensions
 */
import olextent from 'ol/extent'
import olproj from 'ol/proj'
import { EXTENT_CORNER, PROJ_UNIT } from './consts'

export const {
  getWidth,
  getHeight,
  boundingExtent,
  buffer,
  equals,
  extend,
} = olextent

/**
 * Create a new extent or update the provided extent.
 * @param {number} minX Minimum X.
 * @param {number} minY Minimum Y.
 * @param {number} maxX Maximum X.
 * @param {number} maxY Maximum Y.
 * @param {ol.Extent=} extent Destination extent.
 * @return {ol.Extent} Extent.
 * @see https://github.com/openlayers/openlayers/blob/master/src/ol/extent.js#L208
 */
export function createOrUpdate (minX, minY, maxX, maxY, extent) {
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
 * @param {ol.Extent} extent Extent.
 * @param {ol.extent.Corner} corner Corner.
 * @return {ol.Coordinate} Corner coordinate.
 * @see https://github.com/openlayers/openlayers/blob/master/src/ol/extent.js#L482
 */
export function getCorner (extent, corner) {
  let coordinate
  if (corner === EXTENT_CORNER.BOTTOM_LEFT) {
    coordinate = olextent.getBottomLeft(extent)
  } else if (corner === EXTENT_CORNER.BOTTOM_RIGHT) {
    coordinate = olextent.getBottomRight(extent)
  } else if (corner === EXTENT_CORNER.TOP_LEFT) {
    coordinate = olextent.getTopLeft(extent)
  } else if (corner === EXTENT_CORNER.TOP_RIGHT) {
    coordinate = olextent.getTopRight(extent)
  } else {
    throw new Error('Invalid corner')
  }
  return coordinate
}

/**
 * Generate a tile grid extent from a projection.  If the projection has an
 * extent, it is used.  If not, a global extent is assumed.
 * @param {ol.ProjectionLike} projection Projection.
 * @return {ol.Extent} Extent.
 * @see https://github.com/openlayers/openlayers/blob/master/src/ol/tilegrid.js#L148
 */
export function fromProjection (projection) {
  projection = olproj.get(projection)
  let extent = projection.getExtent()

  if (!extent) {
    let half = 180 * olproj.METERS_PER_UNIT[PROJ_UNIT.DEGREES] /
      projection.getMetersPerUnit()
    extent = createOrUpdate(-half, -half, half, half)
  }
  return extent
}
