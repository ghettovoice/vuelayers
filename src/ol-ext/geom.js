/**
 * @param {number|number[]} lonOrCoordinates
 * @param {number} [lat]
 * @returns {ol.geom.Point}
 */
import Point from 'ol/geom/point'
import LineString from 'ol/geom/linestring'
import Polygon from 'ol/geom/polygon'
import MultiPoint from 'ol/geom/multipoint'
import MultiLineString from 'ol/geom/multilinestring'
import MultiPolygon from 'ol/geom/multipolygon'
import GeometryCollection from 'ol/geom/geometrycollection'
import tPointOnSurface from '@turf/point-on-surface'
import { GEOMETRY_TYPE } from './consts'
import * as geoJson from './geojson'

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
 * @param {ol.geom.Geometry} geom
 * @return {boolean}
 */
export function isMulti (geom) {
  let multiTypes = [
    GEOMETRY_TYPE.MULTI_POINT,
    GEOMETRY_TYPE.MULTI_LINE_STRING,
    GEOMETRY_TYPE.MULTI_POLYGON,
    GEOMETRY_TYPE.GEOMETRY_COLLECTION
  ]

  return multiTypes.includes(geom.getType())
}

/**
 * @param {ol.geom.SimpleGeometry|ol.geom.GeometryCollection} geom
 * @return {ol.geom.SimpleGeometry}
 * @throws {Error}
 */
export function reduceToSingle (geom) {
  if (!isMulti(geom)) return geom

  switch (geom.getType()) {
    case GEOMETRY_TYPE.MULTI_POINT:
      return geom.getPoint(0)
    case GEOMETRY_TYPE.MULTI_LINE_STRING:
      return geom.getLineString(0)
    case GEOMETRY_TYPE.MULTI_POLYGON:
      return geom.getPolygon(0)
    case GEOMETRY_TYPE.GEOMETRY_COLLECTION:
      return reduceToSingle(geom.getGeometries()[0])
  }
}

/**
 * @param {ol.geom.Geometry} geom
 * @return {ol.geom.Point|undefined}
 */
export function pointOnSurface (geom) {
  const pointFeature = tPointOnSurface(geoJson.writeGeometry(reduceToSingle(geom)))
  if (pointFeature) {
    return point(pointFeature.geometry.coordinates)
  }
}
