/**
 * Projection transform helpers
 */
import { addProjection as addProj, fromLonLat, get as getProj, toLonLat, transform, transformExtent } from 'ol/proj'
import Projection from 'ol/proj/Projection'
import { EPSG_3857, EPSG_4326, GEOMETRY_TYPE } from './consts'

export {
  transform,
  transformExtent,
  getProj,
  addProj,
}

/**
 * @param {Object} options
 * @return {Projection}
 */
export function createProj (options) {
  return new Projection(options)
}

/**
 * @param {number[]} coordinate
 * @param {ProjectionLike} [projection]
 * @return {Coordinate|number[]}
 */
export function pointToLonLat (coordinate, projection = EPSG_3857) {
  return toLonLat(coordinate, projection)
}

/**
 * @param {number[]} coordinate
 * @param {ProjectionLike} [projection]
 * @return {number[]}
 */
export function pointFromLonLat (coordinate, projection = EPSG_3857) {
  return fromLonLat(coordinate, projection)
}

export function transformPoint (coordinate, sourceProjection, destProjection) {
  return transform(coordinate, sourceProjection, destProjection)
}

/**
 * @param {Array<number[]>} coordinates
 * @param {ProjectionLike} [projection]
 * @return {Array<number[]>}
 */
export function lineToLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(point => pointToLonLat(point, projection))
}

/**
 * @param {Array<number[]>} coordinates
 * @param {ProjectionLike} [projection]
 * @return {Array<number[]>}
 */
export function lineFromLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(point => pointFromLonLat(point, projection))
}

export function transformLine (coordinates, sourceProjection, destProjection) {
  return coordinates.map(point => transform(point, sourceProjection, destProjection))
}

/**
 * @param {Array<Array<number[]>>} coordinates
 * @param {ProjectionLike} [projection]
 * @return {Array<Array<number[]>>}
 */
export function polygonToLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(line => lineToLonLat(line, projection))
}

/**
 * @param {Array<Array<number[]>>} coordinates
 * @param {ProjectionLike} [projection]
 * @return {Array<Array<number[]>>}
 */
export function polygonFromLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(line => lineFromLonLat(line, projection))
}

export function transformPolygon (coordinates, sourceProjection, destProjection) {
  return coordinates.map(line => transformLine(line, sourceProjection, destProjection))
}

/**
 * @param {Array<number[]>} coordinates
 * @param {ProjectionLike} [projection]
 * @return {Array<number[]>}
 */
export function multiPointToLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(point => pointToLonLat(point, projection))
}

/**
 * @param {Array<number[]>} coordinates
 * @param {ProjectionLike} [projection]
 * @return {Array<number[]>}
 */
export function multiPointFromLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(point => pointFromLonLat(point, projection))
}

export function transformMultiPoint (coordinates, sourceProjection, destProjection) {
  return coordinates.map(point => transformPoint(point, sourceProjection, destProjection))
}

/**
 * @param {Array<Array<number[]>>} coordinates
 * @param {ProjectionLike} [projection]
 * @return {Array<Array<number[]>>}
 */
export function multiLineToLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(line => lineToLonLat(line, projection))
}

/**
 * @param {Array<Array<number[]>>} coordinates
 * @param {ProjectionLike} [projection]
 * @return {Array<Array<number[]>>}
 */
export function multiLineFromLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(line => lineFromLonLat(line, projection))
}

export function transformMultiLine (coordinates, sourceProjection, destProjection) {
  return coordinates.map(line => transformLine(line, sourceProjection, destProjection))
}

/**
 * @param {Array<Array<Array<number[]>>>} coordinates
 * @param {ProjectionLike} projection
 * @return {Array<Array<Array<number[]>>>}
 */
export function multiPolygonToLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(polygon => polygonToLonLat(polygon, projection))
}

/**
 * @param {Array<Array<Array<number[]>>>} coordinates
 * @param {ProjectionLike} projection
 * @return {Array<Array<Array<number[]>>>}
 */
export function multiPolygonFromLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(polygon => polygonFromLonLat(polygon, projection))
}

export function transformMultiPolygon (coordinates, sourceProjection, destProjection) {
  return coordinates.map(polygon => transformPolygon(polygon, sourceProjection, destProjection))
}

/**
 * Transforms by geom type
 * @type {Object<string, function>}
 */
export const transforms = {
  [GEOMETRY_TYPE.POINT]: {
    toLonLat: pointToLonLat,
    fromLonLat: pointFromLonLat,
    transform: transformPoint,
  },
  [GEOMETRY_TYPE.LINE_STRING]: {
    toLonLat: lineToLonLat,
    fromLonLat: lineFromLonLat,
    transform: transformLine,
  },
  [GEOMETRY_TYPE.POLYGON]: {
    toLonLat: polygonToLonLat,
    fromLonLat: polygonFromLonLat,
    transform: transformPolygon,
  },
  [GEOMETRY_TYPE.MULTI_POINT]: {
    toLonLat: multiPointToLonLat,
    fromLonLat: multiPointFromLonLat,
    transform: transformMultiPoint,
  },
  [GEOMETRY_TYPE.MULTI_LINE_STRING]: {
    toLonLat: multiLineToLonLat,
    fromLonLat: multiLineFromLonLat,
    transform: transformMultiLine,
  },
  [GEOMETRY_TYPE.MULTI_POLYGON]: {
    toLonLat: multiPolygonToLonLat,
    fromLonLat: multiPolygonFromLonLat,
    transform: transformMultiPolygon,
  },
}

/**
 * @param {Extent} extent
 * @param {ProjectionLike} [projection=EPSG:3857]
 * @return {Extent}
 */
export function extentFromLonLat (extent, projection = EPSG_3857) {
  return transformExtent(extent, EPSG_4326, projection)
}

/**
 * @param {Extent} extent
 * @param {ProjectionLike} [projection=EPSG:3857]
 * @return {Extent}
 */
export function extentToLonLat (extent, projection = EPSG_3857) {
  return transformExtent(extent, projection, EPSG_4326)
}
