import size from 'ol/size'
import proj from 'ol/proj'
import tilegrid from 'ol/tilegrid'
import TileGrid from 'ol/tilegrid/tilegrid'
import { createOrUpdate, getCorner, getHeight, getWidth } from './extent'
import { EXTENT_CORNER, MAX_ZOOM, PROJ_UNIT, TILE_SIZE } from './consts'

const { createXYZ } = tilegrid

export {
  createXYZ
}

export function resolutionsFromExtent (extent, maxZoom = MAX_ZOOM, tileSize = TILE_SIZE) {
  tileSize = size.toSize(tileSize)

  const height = getHeight(extent)
  const width = getWidth(extent)

  const maxResolution = Math.max(
    width / tileSize[0], height / tileSize[1])

  const length = maxZoom + 1
  const resolutions = new Array(length)

  for (let z = 0; z < length; ++z) {
    resolutions[z] = maxResolution / Math.pow(2, z)
  }

  return resolutions
}

export function createForExtent (extent, maxZoom = MAX_ZOOM, tileSize = TILE_SIZE, corner = EXTENT_CORNER.TOP_LEFT) {
  const resolutions = resolutionsFromExtent(extent, maxZoom, tileSize)

  return new TileGrid({
    extent,
    origin: getCorner(extent, corner),
    resolutions,
    tileSize
  })
}

export function createForProjection (
  projection,
  maxZoom = MAX_ZOOM,
  tileSize = TILE_SIZE,
  corner = EXTENT_CORNER.BOTTOM_LEFT
) {
  const extent = extentFromProjection(projection)

  return createForExtent(extent, maxZoom, tileSize, corner)
}

export function extentFromProjection (projection) {
  projection = proj.get(projection)
  let extent = projection.getExtent()

  if (!extent) {
    let half = 180 * proj.METERS_PER_UNIT[PROJ_UNIT.DEGREES] /
      projection.getMetersPerUnit()
    extent = createOrUpdate(-half, -half, half, half)
  }
  return extent
}
