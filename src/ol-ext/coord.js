import GeometryType from 'ol/geom/GeometryType'
import { isEqual, round } from '../util/minilo'

export const COORD_PRECISION = -1

export function roundExtent (extent, precision = COORD_PRECISION) {
  if (!extent) return

  return extent.map(x => round(x, precision))
}

export function roundCoords (geomType, coordinates, precision = COORD_PRECISION) {
  const pointMapper = x => round(x, precision)
  const lineMapper = point => point.map(pointMapper)
  const polygonMapper = line => line.map(lineMapper)

  switch (geomType) {
    case GeometryType.POINT:
    case GeometryType.CIRCLE:
      return coordinates.map(pointMapper)
    case GeometryType.LINE_STRING:
    case GeometryType.MULTI_POINT:
      return coordinates.map(lineMapper)
    case GeometryType.POLYGON:
    case GeometryType.MULTI_LINE_STRING:
      return coordinates.map(polygonMapper)
    case GeometryType.MULTI_POLYGON:
      return coordinates.map(polygon => polygon.map(polygonMapper))
  }
}

export function flatCoords (geomType, coordinates) {
  const polygonReducer = (coords, lineString) => coords.concat(lineString)

  switch (geomType) {
    case GeometryType.POINT:
      return [coordinates]
    case GeometryType.LINE_STRING:
    case GeometryType.MULTI_POINT:
      return coordinates
    case GeometryType.POLYGON:
    case GeometryType.MULTI_LINE_STRING:
      return coordinates.reduce(polygonReducer, [])
    case GeometryType.MULTI_POLYGON:
      return coordinates.reduce((coords, polygon) => coords.concat(polygon.reduce(polygonReducer, [])), [])
    default:
      // todo maybe return null?
      return []
  }
}

/**
 * @param {{coordinates: number[], extent: number[]}} a
 * @param {{coordinates: number[], extent: number[]}} b
 * @returns {boolean}
 */
export function isEqualCoord (a, b) {
  return isEqual(a.extent, b.extent)
    ? isEqual(a.coordinates, b.coordinates)
    : false
}

export function calcDistance (point1, point2, precision = COORD_PRECISION) {
  const dx = point2[0] - point1[0]
  const dy = point2[1] - point1[1]
  const squared = dx * dx + dy * dy

  return round(Math.sqrt(squared), COORD_PRECISION)
}
