import turfPointOnSurface from '@turf/point-on-surface'
import GeometryCollection from 'ol/geom/geometrycollection'
import LineString from 'ol/geom/linestring'
import MultiLineString from 'ol/geom/multilinestring'
import MultiPoint from 'ol/geom/multipoint'
import MultiPolygon from 'ol/geom/multipolygon'
import Point from 'ol/geom/point'
import Polygon from 'ol/geom/polygon'
import { GEOMETRY_TYPE, WGS84_SPHERE } from './consts'

/**
 * @param {number|number[]} lonOrCoordinates
 * @param {number} [lat]
 * @return {ol.geom.Point}
 */
export function point (lonOrCoordinates, lat) {
  const coordinates = Array.isArray(lonOrCoordinates)
    ? lonOrCoordinates
    : [lonOrCoordinates, lat]

  return new Point(coordinates)
}

/**
 * @param {Array<number[]>} points
 * @returns {ol.geom.LineString}
 */
export function line (points) {
  return new LineString(points)
}

/**
 * @param {Array<Array<number[]>>} rings
 * @returns {ol.geom.Polygon}
 */
export function polygon (rings) {
  return new Polygon(rings)
}

/**
 * @param {Array<number[]>} points
 * @returns {ol.geom.MultiPoint}
 */
export function multiPoint (points) {
  return new MultiPoint(points)
}

/**
 * @param {Array<Array<number[]>>} lines
 * @returns {ol.geom.MultiLineString}
 */
export function multiLine (lines) {
  return new MultiLineString(lines)
}

/**
 * @param {Array<Array<Array<number[]>>>} polygons
 * @returns {ol.geom.MultiPolygon}
 */
export function multiPolygon (polygons) {
  return new MultiPolygon(polygons)
}

/**
 * @param {ol.geom.Geometry[]} geoms
 * @returns {ol.geom.GeometryCollection}
 */
export function collection (geoms) {
  return new GeometryCollection(geoms)
}

/**
 * @param {ol.Coordinate|number[]} center
 * @param {number} radius
 * @return {ol.geom.Polygon}
 */
export function circularPolygon (center, radius) {
  return Polygon.circular(WGS84_SPHERE, center, radius)
}

/**
 * @param {ol.geom.Geometry|GeoJSONGeometry} geom
 * @return {boolean}
 * @throws {Error}
 */
export function isMulti (geom) {
  let multiTypes = [
    GEOMETRY_TYPE.MULTI_POINT,
    GEOMETRY_TYPE.MULTI_LINE_STRING,
    GEOMETRY_TYPE.MULTI_POLYGON,
    GEOMETRY_TYPE.GEOMETRY_COLLECTION,
  ]

  return multiTypes.includes(geom.type || geom.getType())
}

/**
 * @param {ol.geom.Geometry|GeoJSONGeometry} geom
 * @return {ol.geom.SimpleGeometry|GeoJSONGeometry}
 * @throws {Error}
 */
export function toSimpleGeom (geom) {
  const type = geom.type || geom.getType()
  const complexTypes = [
    GEOMETRY_TYPE.GEOMETRY_COLLECTION,
  ]

  if (!complexTypes.includes(type)) return geom

  return (geom.geometries || geom.getGeometries())[0]
}

/**
 * @param {ol.geom.Geometry|GeoJSONGeometry} geom
 * @return {ol.Coordinate|undefined}
 */
export function pointOnSurface (geom) {
  const simpleGeom = toSimpleGeom(geom)
  const pointFeature = turfPointOnSurface({
    type: simpleGeom.type || simpleGeom.getType(),
    coordinates: simpleGeom.coordinates || simpleGeom.getCoordinates(),
  })

  if (pointFeature && pointFeature.geometry) {
    return pointFeature.geometry.coordinates
  }
}
