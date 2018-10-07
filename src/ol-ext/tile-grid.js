import { toSize } from 'ol/size'
import { createXYZ as createXyzGrid } from 'ol/tilegrid'
import TileGrid from 'ol/tilegrid/TileGrid'
import { EXTENT_CORNER, MAX_ZOOM, TILE_SIZE } from './consts'
import { createExtentFromProjection, getExtentCorner, getExtentHeight, getExtentWidth } from './extent'

export {
  createXyzGrid,
}

/**
 * Create a resolutions array from an extent.  A zoom factor of 2 is assumed.
 * @param {Extent} extent Extent.
 * @param {number=} maxZoom Maximum zoom level (default is
 *     ol.DEFAULT_MAX_ZOOM).
 * @param {number|Size=} tileSize Tile size (default uses
 *     ol.DEFAULT_TILE_SIZE).
 * @return {!Array.<number>} Resolutions array.
 * @see https://github.com/openlayers/openlayers/blob/master/src/ol/tilegrid.js#L104
 */
export function resolutionsFromExtent (extent, maxZoom = MAX_ZOOM, tileSize = TILE_SIZE) {
  tileSize = toSize(tileSize)

  const height = getExtentHeight(extent)
  const width = getExtentWidth(extent)

  const maxResolution = Math.max(
    width / tileSize[0], height / tileSize[1])

  const length = maxZoom + 1
  const resolutions = new Array(length)

  for (let z = 0; z < length; ++z) {
    resolutions[z] = maxResolution / Math.pow(2, z)
  }

  return resolutions
}

/**
 * @param {Extent} extent Extent.
 * @param {number=} maxZoom Maximum zoom level (default is MAX_ZOOM).
 * @param {number|Size=} tileSize Tile size (default uses TILE_SIZE).
 * @param {string} [corner] Extent corner (default is EXTENT_CORNER.TOP_LEFT).
 * @return {TileGrid} TileGrid instance.
 * @see https://github.com/openlayers/openlayers/blob/master/src/ol/tilegrid.js#L58
 */
export function createGridForExtent (
  extent,
  maxZoom = MAX_ZOOM,
  tileSize = TILE_SIZE,
  corner = EXTENT_CORNER.TOP_LEFT,
) {
  const resolutions = resolutionsFromExtent(extent, maxZoom, tileSize)

  return new TileGrid({
    extent,
    origin: getExtentCorner(extent, corner),
    resolutions,
    tileSize,
  })
}

/**
 * @param {ProjectionLike} projection Projection.
 * @param {number=} maxZoom Maximum zoom level (default is
 *     ol.DEFAULT_MAX_ZOOM).
 * @param {number|Size=} tileSize Tile size (default uses ol.DEFAULT_TILE_SIZE).
 * @param {string} corner Extent corner (default is
 *     ol.extent.Corner.BOTTOM_LEFT).
 * @return {TileGrid} TileGrid instance.
 * @see https://github.com/openlayers/openlayers/blob/master/src/ol/tilegrid.js#L135
 */
export function createGridForProjection (
  projection,
  maxZoom = MAX_ZOOM,
  tileSize = TILE_SIZE,
  corner = EXTENT_CORNER.BOTTOM_LEFT,
) {
  return createGridForExtent(createExtentFromProjection(projection), maxZoom, tileSize, corner)
}
