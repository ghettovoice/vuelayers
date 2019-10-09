import GeometryType from 'ol/geom/GeometryType'
import { fromLonLat, toLonLat, transform, transformExtent } from 'ol/proj'

export const EPSG_4326 = 'EPSG:4326'
export const EPSG_3857 = 'EPSG:3857'

export {
  transform,
  transformExtent,
}

/**
 * @param {number[]} coordinate
 * @param {module:ol/proj.ProjectionLike} [projection]
 * @return {Coordinate|number[]}
 */
export function pointToLonLat (coordinate, projection = EPSG_3857) {
  return toLonLat(coordinate, projection)
}

/**
 * @param {number[]} coordinate
 * @param {module:ol/proj.ProjectionLike} [projection]
 * @return {number[]}
 */
export function pointFromLonLat (coordinate, projection = EPSG_3857) {
  return fromLonLat(coordinate, projection)
}

/**
 * @param {number[]} coordinate
 * @param {module:ol/proj.ProjectionLike} sourceProjection
 * @param {module:ol/proj.ProjectionLike} destProjection
 * @returns {number[]}
 */
export function transformPoint (coordinate, sourceProjection, destProjection) {
  return transform(coordinate, sourceProjection, destProjection)
}

/**
 * @param {Array<number[]>} coordinates
 * @param {module:ol/proj.ProjectionLike} [projection]
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

/**
 * @param {number[]} coordinates
 * @param {module:ol/proj.ProjectionLike} sourceProjection
 * @param {module:ol/proj.ProjectionLike} destProjection
 * @returns {number[]}
 */
export function transformLine (coordinates, sourceProjection, destProjection) {
  return coordinates.map(point => transform(point, sourceProjection, destProjection))
}

/**
 * @param {Array<Array<number[]>>} coordinates
 * @param {module:ol/proj.ProjectionLike} [projection]
 * @return {Array<Array<number[]>>}
 */
export function polygonToLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(line => lineToLonLat(line, projection))
}

/**
 * @param {Array<Array<number[]>>} coordinates
 * @param {module:ol/proj.ProjectionLike} [projection]
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
 * @param {module:ol/proj.ProjectionLike} [projection]
 * @return {Array<number[]>}
 */
export function multiPointToLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(point => pointToLonLat(point, projection))
}

/**
 * @param {Array<number[]>} coordinates
 * @param {module:ol/proj.ProjectionLike} [projection]
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
 * @param {module:ol/proj.ProjectionLike} [projection]
 * @return {Array<Array<number[]>>}
 */
export function multiLineToLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(line => lineToLonLat(line, projection))
}

/**
 * @param {Array<Array<number[]>>} coordinates
 * @param {module:ol/proj.ProjectionLike} [projection]
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
 * @param {module:ol/proj.ProjectionLike} projection
 * @return {Array<Array<Array<number[]>>>}
 */
export function multiPolygonToLonLat (coordinates, projection = EPSG_3857) {
  return coordinates.map(polygon => polygonToLonLat(polygon, projection))
}

/**
 * @param {Array<Array<Array<number[]>>>} coordinates
 * @param {module:ol/proj.ProjectionLike} projection
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
  [GeometryType.POINT]: {
    toLonLat: pointToLonLat,
    fromLonLat: pointFromLonLat,
    transform: transformPoint,
  },
  [GeometryType.LINE_STRING]: {
    toLonLat: lineToLonLat,
    fromLonLat: lineFromLonLat,
    transform: transformLine,
  },
  [GeometryType.POLYGON]: {
    toLonLat: polygonToLonLat,
    fromLonLat: polygonFromLonLat,
    transform: transformPolygon,
  },
  [GeometryType.MULTI_POINT]: {
    toLonLat: multiPointToLonLat,
    fromLonLat: multiPointFromLonLat,
    transform: transformMultiPoint,
  },
  [GeometryType.MULTI_LINE_STRING]: {
    toLonLat: multiLineToLonLat,
    fromLonLat: multiLineFromLonLat,
    transform: transformMultiLine,
  },
  [GeometryType.MULTI_POLYGON]: {
    toLonLat: multiPolygonToLonLat,
    fromLonLat: multiPolygonFromLonLat,
    transform: transformMultiPolygon,
  },
}

/**
 * @param {Extent} extent
 * @param {module:ol/proj.ProjectionLike} [projection=EPSG:3857]
 * @return {Extent}
 */
export function extentFromLonLat (extent, projection = EPSG_3857) {
  return transformExtent(extent, EPSG_4326, projection)
}

/**
 * @param {Extent} extent
 * @param {module:ol/proj.ProjectionLike} [projection=EPSG:3857]
 * @return {Extent}
 */
export function extentToLonLat (extent, projection = EPSG_3857) {
  return transformExtent(extent, projection, EPSG_4326)
}
