// copy-paste from ol/extent
import { getBottomLeft, getBottomRight, getTopLeft, getTopRight } from 'ol/extent'
import { ExtentCorner } from './enums'
import { assert } from '../utils'

export function createOrUpdate (minX, minY, maxX, maxY, extent) {
  if (extent) {
    extent[0] = minX
    extent[1] = minY
    extent[2] = maxX
    extent[3] = maxY
    return extent
  }
  return [minX, minY, maxX, maxY]
}

export function getCorner (extent, corner) {
  let coordinate
  if (corner === ExtentCorner.BOTTOM_LEFT) {
    coordinate = getBottomLeft(extent)
  } else if (corner === ExtentCorner.BOTTOM_RIGHT) {
    coordinate = getBottomRight(extent)
  } else if (corner === ExtentCorner.TOP_LEFT) {
    coordinate = getTopLeft(extent)
  } else if (corner === ExtentCorner.TOP_RIGHT) {
    coordinate = getTopRight(extent)
  } else {
    assert(false, 'Invalid extent corner')
  }
  return coordinate
}
