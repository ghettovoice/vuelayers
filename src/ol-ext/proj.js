/**
 * Projection transform helpers
 */
import proj from 'ol/proj'
import { GEOMETRY_TYPE, EPSG_3857, EPSG_4326 } from './consts'

const { fromLonLat, toLonLat, transformExtent } = proj
export {
  fromLonLat,
  toLonLat
}

export function pointToLonLat (coordinate, projection = EPSG_3857) {
  return toLonLat(coordinate, projection)
}
export function pointFromLonLat (coordinate, projection = EPSG_3857) {
  return fromLonLat(coordinate, projection)
}

export function lineToLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(point => pointToLonLat(point, projection))
}
export function lineFromLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(point => pointFromLonLat(point, projection))
}

export function polygonToLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(line => lineToLonLat(line, projection))
}
export function polygonFromLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(line => lineFromLonLat(line, projection))
}

export function multiPointToLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(point => pointToLonLat(point, projection))
}
export function multiPointFromLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(point => pointFromLonLat(point, projection))
}

export function multiLineToLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(line => lineToLonLat(line, projection))
}
export function multiLineFromLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(line => lineFromLonLat(line, projection))
}

export function multiPolygonToLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(polygon => polygonToLonLat(polygon, projection))
}
export function multiPolygonFromLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(polygon => polygonFromLonLat(polygon, projection))
}

export const transforms = {
  [ GEOMETRY_TYPE.POINT ]: {
    toLonLat: pointToLonLat,
    fromLonLat: pointFromLonLat
  },
  [ GEOMETRY_TYPE.LINE_STRING ]: {
    toLonLat: lineToLonLat,
    fromLonLat: lineFromLonLat
  },
  [ GEOMETRY_TYPE.POLYGON ]: {
    toLonLat: polygonToLonLat,
    fromLonLat: polygonFromLonLat
  },
  [ GEOMETRY_TYPE.MULTI_POINT ]: {
    toLonLat: multiPointToLonLat,
    fromLonLat: multiPointFromLonLat
  },
  [ GEOMETRY_TYPE.MULTI_LINE_STRING ]: {
    toLonLat: multiLineToLonLat,
    fromLonLat: multiLineFromLonLat
  },
  [ GEOMETRY_TYPE.MULTI_POLYGON ]: {
    toLonLat: multiPolygonToLonLat,
    fromLonLat: multiPolygonFromLonLat
  }
}

/**
 * @param {ol.Extent} extent
 * @param {ol.ProjectionLike} [projection=EPSG:3857]
 * @return {ol.Extent}
 */
export function extentFromLonLat (extent, projection = EPSG_3857) {
  return transformExtent(extent, EPSG_4326, projection)
}

/**
 * @param {ol.Extent} extent
 * @param {ol.ProjectionLike} [projection=EPSG:3857]
 * @return {ol.Extent}
 */
export function extentToLonLat (extent, projection = EPSG_3857) {
  return transformExtent(extent, projection, EPSG_4326)
}
