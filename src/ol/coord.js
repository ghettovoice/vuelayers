import ol from 'openlayers'
import { MAP_PROJECTION, DATA_PROJECTION } from './consts'

/**
 * @param {ol.Extent} extent
 * @param {ol.ProjectionLike} projection
 * @return {ol.Extent}
 */
export function extentFromLonLat (extent, projection = MAP_PROJECTION) {
  return ol.proj.transformExtent(extent, DATA_PROJECTION, projection)
}

/**
 * @param {ol.Extent} extent
 * @param {ol.ProjectionLike} projection
 * @return {ol.Extent}
 */
export function extentToLonLat (extent, projection = MAP_PROJECTION) {
  return ol.proj.transformExtent(extent, projection, DATA_PROJECTION)
}

export function pointToLonLat (coordinate, projection = MAP_PROJECTION) {
  return ol.proj.toLonLat(coordinate, projection)
}
export function pointFromLonLat (coordinate, projection = MAP_PROJECTION) {
  return ol.proj.fromLonLat(coordinate, projection)
}

export function lineToLonLat (coordinates, projection = MAP_PROJECTION) {
  return coordinates.map(point => pointToLonLat(point, projection))
}
export function lineFromLonLat (coordinates, projection = MAP_PROJECTION) {
  return coordinates.map(point => pointFromLonLat(point, projection))
}

export function polygonToLonLat (coordinates, projection = MAP_PROJECTION) {
  return coordinates.map(line => lineToLonLat(line, projection))
}
export function polygonFromLonLat (coordinates, projection = MAP_PROJECTION) {
  return coordinates.map(line => lineFromLonLat(line, projection))
}

export function multiPointToLonLat (coordinates, projection = MAP_PROJECTION) {
  return coordinates.map(point => pointToLonLat(point, projection))
}
export function multiPointFromLonLat (coordinates, projection = MAP_PROJECTION) {
  return coordinates.map(point => pointFromLonLat(point, projection))
}

export function multiLineToLonLat (coordinates, projection = MAP_PROJECTION) {
  return coordinates.map(line => lineToLonLat(line, projection))
}
export function multiLineFromLonLat (coordinates, projection = MAP_PROJECTION) {
  return coordinates.map(line => lineFromLonLat(line, projection))
}

export function multiPolygonToLonLat (coordinates, projection = MAP_PROJECTION) {
  return coordinates.map(polygon => polygonToLonLat(polygon, projection))
}
export function multiPolygonFromLonLat (coordinates, projection = MAP_PROJECTION) {
  return coordinates.map(polygon => polygonFromLonLat(polygon, projection))
}

export const coordTransform = {
  Point: {
    toLonLat: pointToLonLat,
    fromLonLat: pointFromLonLat
  },
  LineString: {
    toLonLat: lineToLonLat,
    fromLonLat: lineFromLonLat
  },
  Polygon: {
    toLonLat: polygonToLonLat,
    fromLonLat: polygonFromLonLat
  },
  MultiPoint: {
    toLonLat: multiPointToLonLat,
    fromLonLat: multiPointFromLonLat
  },
  MultiLineString: {
    toLonLat: multiLineToLonLat,
    fromLonLat: multiLineFromLonLat
  },
  MultiPolygon: {
    toLonLat: multiPolygonToLonLat,
    fromLonLat: multiPolygonFromLonLat
  }
}
