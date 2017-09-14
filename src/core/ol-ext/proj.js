/**
 * Projection transform helpers
 */
import olproj from 'ol/proj'
import { EPSG_3857, EPSG_4326, GEOMETRY_TYPE } from './consts'

export const {
  fromLonLat,
  toLonLat,
  transform,
  transformExtent,
  getPointResolution,
  get,
  equivalent,
} = olproj

/**
 * @param {number[]} coordinate
 * @param {ol.ProjectionLike} [projection]
 * @return {number[]}
 */
export function pointToLonLat (coordinate, projection = EPSG_3857) {
  return toLonLat(coordinate, projection)
}
/**
 * @param {number[]} coordinate
 * @param {ol.ProjectionLike} [projection]
 * @return {number[]}
 */
export function pointFromLonLat (coordinate, projection = EPSG_3857) {
  return fromLonLat(coordinate, projection)
}

/**
 * @param {Array<number[]>} coordinates
 * @param {ol.ProjectionLike} [projection]
 * @return {Array<number[]>}
 */
export function lineToLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(point => pointToLonLat(point, projection))
}
/**
 * @param {Array<number[]>} coordinates
 * @param {ol.ProjectionLike} [projection]
 * @return {Array<number[]>}
 */
export function lineFromLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(point => pointFromLonLat(point, projection))
}

/**
 * @param {Array<Array<number[]>>} coordinates
 * @param {ol.ProjectionLike} [projection]
 * @return {Array<Array<number[]>>}
 */
export function polygonToLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(line => lineToLonLat(line, projection))
}
/**
 * @param {Array<Array<number[]>>} coordinates
 * @param {ol.ProjectionLike} [projection]
 * @return {Array<Array<number[]>>}
 */
export function polygonFromLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(line => lineFromLonLat(line, projection))
}

/**
 * @param {Array<number[]>} coordinates
 * @param {ol.ProjectionLike} [projection]
 * @return {Array<number[]>}
 */
export function multiPointToLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(point => pointToLonLat(point, projection))
}
/**
 * @param {Array<number[]>} coordinates
 * @param {ol.ProjectionLike} [projection]
 * @return {Array<number[]>}
 */
export function multiPointFromLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(point => pointFromLonLat(point, projection))
}

/**
 * @param {Array<Array<number[]>>} coordinates
 * @param {ol.ProjectionLike} [projection]
 * @return {Array<Array<number[]>>}
 */
export function multiLineToLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(line => lineToLonLat(line, projection))
}
/**
 * @param {Array<Array<number[]>>} coordinates
 * @param {ol.ProjectionLike} [projection]
 * @return {Array<Array<number[]>>}
 */
export function multiLineFromLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(line => lineFromLonLat(line, projection))
}

/**
 * @param {Array<Array<Array<number[]>>>} coordinates
 * @param {ol.ProjectionLike} projection
 * @return {Array<Array<Array<number[]>>>}
 */
export function multiPolygonToLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(polygon => polygonToLonLat(polygon, projection))
}
/**
 * @param {Array<Array<Array<number[]>>>} coordinates
 * @param {ol.ProjectionLike} projection
 * @return {Array<Array<Array<number[]>>>}
 */
export function multiPolygonFromLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(polygon => polygonFromLonLat(polygon, projection))
}

/**
 * Transforms by geom type
 * @type {Object<string, function>}
 */
export const transforms = {
  [ GEOMETRY_TYPE.POINT ]: {
    toLonLat: pointToLonLat,
    fromLonLat: pointFromLonLat,
  },
  [ GEOMETRY_TYPE.LINE_STRING ]: {
    toLonLat: lineToLonLat,
    fromLonLat: lineFromLonLat,
  },
  [ GEOMETRY_TYPE.POLYGON ]: {
    toLonLat: polygonToLonLat,
    fromLonLat: polygonFromLonLat,
  },
  [ GEOMETRY_TYPE.MULTI_POINT ]: {
    toLonLat: multiPointToLonLat,
    fromLonLat: multiPointFromLonLat,
  },
  [ GEOMETRY_TYPE.MULTI_LINE_STRING ]: {
    toLonLat: multiLineToLonLat,
    fromLonLat: multiLineFromLonLat,
  },
  [ GEOMETRY_TYPE.MULTI_POLYGON ]: {
    toLonLat: multiPolygonToLonLat,
    fromLonLat: multiPolygonFromLonLat,
  },
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
