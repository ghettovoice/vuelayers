import pointOnFeature from '@turf/point-on-feature'
import {
  Circle,
  Geometry,
  GeometryCollection,
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon,
} from 'ol/geom'
import GeometryType from 'ol/geom/GeometryType'
import { circular as circularPolygon } from 'ol/geom/Polygon'
import { v4 as uuid } from 'uuid'
import { isPlainObject } from '../util/minilo'
import { COORD_PRECISION, roundCoords } from './coord'

/**
 * @param {number|number[]} lonOrCoordinates
 * @param {number} [lat]
 * @return {Point}
 */
export function createPointGeom (lonOrCoordinates, lat) {
  const coordinates = Array.isArray(lonOrCoordinates)
    ? lonOrCoordinates
    : [lonOrCoordinates, lat]

  return new Point(coordinates)
}

/**
 * @param {Array<number[]>} points
 * @returns {LineString}
 */
export function createLineGeom (points) {
  return new LineString(points)
}

/**
 * @param {Array<Array<number[]>>} rings
 * @returns {Polygon}
 */
export function createPolygonGeom (rings) {
  return new Polygon(rings)
}

/**
 * @param {Array<number[]>} points
 * @returns {MultiPoint}
 */
export function createMultiPointGeom (points) {
  return new MultiPoint(points)
}

/**
 * @param {Array<Array<number[]>>} lines
 * @returns {MultiLineString}
 */
export function createMultiLineGeom (lines) {
  return new MultiLineString(lines)
}

/**
 * @param {Array<Array<Array<number[]>>>} polygons
 * @returns {MultiPolygon}
 */
export function createMultiPolygonGeom (polygons) {
  return new MultiPolygon(polygons)
}

/**
 * @param {Geometry[]} geoms
 * @returns {GeometryCollection}
 */
export function createGeomCollection (geoms) {
  return new GeometryCollection(geoms)
}

/**
 * @param {Coordinate|number[]} center
 * @param {number} radius
 * @return {Polygon}
 */
export function createCircularPolygon (center, radius) {
  return circularPolygon(center, radius)
}

/**
 * @param {Geometry|Object} geom
 * @return {boolean}
 * @throws {Error}
 */
export function isMultiGeom (geom) {
  const multiTypes = [
    GeometryType.MULTI_POINT,
    GeometryType.MULTI_LINE_STRING,
    GeometryType.MULTI_POLYGON,
    GeometryType.GEOMETRY_COLLECTION,
  ]

  return multiTypes.includes(geom.type || geom.getType())
}

/**
 * @param {Geometry|Object} geom
 * @return {SimpleGeometry|Object}
 * @throws {Error}
 */
export function toSimpleGeom (geom) {
  if (geom instanceof Circle) {
    geom = createPointGeom(geom.getCenter())
  } else if (geom.type === GeometryType.CIRCLE) {
    geom = { ...geom, type: GeometryType.POINT }
  }

  const type = geom.type || geom.getType()
  const complexTypes = [
    GeometryType.GEOMETRY_COLLECTION,
  ]

  if (complexTypes.includes(type) === false) {
    return geom
  }

  return (geom.geometries || geom.getGeometries())[0]
}

/**
 * @param {Geometry|Object} geom
 * @param {number} [precision=COORD_PRECISION]
 * @return {Coordinate|undefined}
 */
export function findPointOnSurface (geom, precision = COORD_PRECISION) {
  const simpleGeom = toSimpleGeom(geom)
  const pointFeature = pointOnFeature({
    type: simpleGeom.type || simpleGeom.getType(),
    coordinates: simpleGeom.coordinates || simpleGeom.getCoordinates(),
  })
  if (pointFeature?.geometry) {
    return roundCoords(
      pointFeature.geometry.type,
      pointFeature.geometry.coordinates,
      precision,
    )
  }
}

export function getGeometryId (geometry) {
  if (geometry instanceof Geometry) {
    return geometry.get('id')
  } else if (isPlainObject(geometry)) {
    return geometry.id
  }

  throw new Error('Illegal geometry argument')
}

export function setGeometryId (geometry, geometryId) {
  if (geometry instanceof Geometry) {
    geometry.set('id', geometryId)

    return geometry
  } else if (isPlainObject(geometry)) {
    geometry.id = geometryId

    return geometry
  }

  throw new Error('Illegal geometry argument')
}

export function initializeGeometry (geometry, defaultGeometryId) {
  if (getGeometryId(geometry) == null) {
    setGeometryId(geometry, defaultGeometryId || uuid())
  }

  return geometry
}

/**
 * @param value
 * @return {boolean}
 */
export function isCircleGeom (value) {
  return getGeomType(value) === GeometryType.CIRCLE
}

export function getGeomCoords (geom) {
  if (!geom) return

  const type = getGeomType(geom)
  switch (type) {
    case GeometryType.CIRCLE:
      return roundCoords(type, geom.coordinates || geom.getCenter())
    default:
      return roundCoords(type, geom.coordinates || geom.getCoordinates())
  }
}

export function getGeomType (geom) {
  if (geom instanceof Geometry) {
    return geom.getType()
  }
  return geom?.type
}
