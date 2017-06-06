/**
 * Extent extensions
 */
import olextent from 'ol/extent'
import { EXTENT_CORNER } from './consts'

const { getWidth, getHeight, boundingExtent } = olextent

export {
  getHeight,
  getWidth,
  boundingExtent
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
