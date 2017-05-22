/**
 * Extent extensions
 */
import proj from 'ol/proj'
import extentHelper from 'ol/extent'
import { DATA_PROJECTION, EXTENT_CORNER, MAP_PROJECTION } from './consts'

const { transformExtent } = proj
const { getWidth, getHeight, boundingExtent } = extentHelper

export {
  transformExtent as transform,
  getHeight,
  getWidth,
  boundingExtent
}

/**
 * @param {ol.Extent} extent
 * @param {ol.ProjectionLike} projection
 * @return {ol.Extent}
 */
export function fromLonLat (extent, projection = MAP_PROJECTION) {
  return transformExtent(extent, DATA_PROJECTION, projection)
}

/**
 * @param {ol.Extent} extent
 * @param {ol.ProjectionLike} projection
 * @return {ol.Extent}
 */
export function toLonLat (extent, projection = MAP_PROJECTION) {
  return transformExtent(extent, projection, DATA_PROJECTION)
}

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

export function getCorner (extent, corner) {
  let coordinate
  if (corner === EXTENT_CORNER.BOTTOM_LEFT) {
    coordinate = extentHelper.getBottomLeft(extent)
  } else if (corner === EXTENT_CORNER.BOTTOM_RIGHT) {
    coordinate = extentHelper.getBottomRight(extent)
  } else if (corner === EXTENT_CORNER.TOP_LEFT) {
    coordinate = extentHelper.getTopLeft(extent)
  } else if (corner === EXTENT_CORNER.TOP_RIGHT) {
    coordinate = extentHelper.getTopRight(extent)
  } else {
    throw new Error('Invalid corner')
  }
  return coordinate
}
