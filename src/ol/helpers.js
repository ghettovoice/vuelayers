import ol from 'openlayers'
import { isEqual } from 'lodash/fp'
import { EARTH_RADIUS, WGS84_SPHERE, TILE_SIZE } from './consts'

/**
 * @param {number} zoom
 * @param {number} [latitude=0.0]
 * @param {number} [tileSize=256]
 * @return {number}
 */
export function zoomToResolution (zoom, latitude = 0.0, tileSize = TILE_SIZE) {
  // meters per pixel at zoom = 0
  const mpp = 2 * Math.PI * EARTH_RADIUS / tileSize

  return mpp * Math.cos(latitude) / Math.pow(2, zoom)
}
/**
 * @param {number} resolution
 * @param {number} [latitude=0.0]
 * @param {number} [tileSize=256]
 * @return {number}
 */
export function resolutionToZoom (resolution, latitude = 0.0, tileSize = TILE_SIZE) {
  // meters per pixel at zoom = 0
  const mpp = 2 * Math.PI * EARTH_RADIUS / tileSize

  return Math.round(Math.log(mpp * Math.cos(latitude) / resolution) / Math.log(2))
}

/**
 * @param {string[]} attributions
 * @return {ol.Attribution[]}
 */
export function createAttributions (attributions) {
  return (attributions || []).map(html => new ol.Attribution({ html }))
}

/**
 * @param {number[]} p1 First point in EPSG:4326
 * @param {number[]} p2 Second point in EPSG:4326
 * @return {number} Distance in meters.
 */
export function haversineDistance (p1, p2) {
  return WGS84_SPHERE.haversineDistance(p1, p2)
}

/**
 * @param {ol.View} view
 * @param {number[]} coordinate Coordinate in EPSG:4326
 * @param {number} zoom
 * @return {Promise}
 */
export function flyTo (view, coordinate, zoom) {
  const currentZoom = Math.ceil(view.getZoom())
  const currentCenter = ol.proj.toLonLat(view.getCenter(), view.getProjection())
  const distance = haversineDistance(currentCenter, coordinate)
  const duration = Math.log10(distance / 1000) * 1000

  const centerPromise = new Promise(
    resolve => view.animate({
      center: coordinate,
      duration
    }, resolve)
  )

  let zoomPromise
  if (
    currentZoom >= 10 &&
    distance >= 10000 && !isEqual(coordinate, currentCenter)
  ) {
    zoomPromise = new Promise(
      resolve => view.animate({
        zoom: Math.ceil(currentZoom / 2),
        duration: duration / 2
      }, {
        zoom,
        duration: duration / 2
      }, resolve)
    )
  } else {
    zoomPromise = new Promise(
      resolve => view.animate({
        zoom,
        duration
      })
    )
  }

  return Promise.all([ centerPromise, zoomPromise ])
}
