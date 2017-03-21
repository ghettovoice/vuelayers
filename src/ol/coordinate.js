/**
 * Coordinate extensions
 */
import ol from 'openlayers'
import { MAP_PROJECTION, GEOMETRY_TYPE } from './consts'

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

export default {
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
