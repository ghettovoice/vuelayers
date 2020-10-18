import LRU from 'lru-cache'
import {
  COORD_PRECISION,
  EPSG_3857,
  getFeatureGeom,
  getFeatureId,
  getFeatureProperties,
  getGeomCoords,
  getGeomType,
  readGeoJsonFeature,
  readGeoJsonGeometry,
  transformExtent,
  transformLine,
  transformMultiLine,
  transformMultiPoint,
  transformMultiPolygon,
  transformPoint,
  transformPolygon,
  writeGeoJsonFeature,
  writeGeoJsonGeometry,
} from '../ol-ext'
import { coalesce, serialize } from '../utils'

/**
 * Mixin with helpers for projection transforms between current view projection and global defined projection.
 */
export default {
  computed: {
    /**
     * @return {module:ol/proj~ProjectionLike}
     */
    resolvedViewProjection () {
      return coalesce(
        this.viewProjection,
        EPSG_3857,
      )
    },
    /**
     * @return {module:ol/proj~ProjectionLike}
     */
    resolvedDataProjection () {
      return coalesce(
        this.projection, // may or may not be present
        this.$options?.dataProjection, // may or may not be present
        this.dataProjection, // may or may not be present
        this.resolvedViewProjection,
      )
    },
  },
  created () {
    this._projTransformCache = new LRU({
      max: 10e3,
      maxAge: 3600e3,
    })
  },
  methods: {
    pointToViewProj (point, precision = COORD_PRECISION) {
      return transformPoint(point, this.resolvedDataProjection, this.resolvedViewProjection, precision)
    },
    pointToDataProj (point, precision = COORD_PRECISION) {
      return transformPoint(point, this.resolvedViewProjection, this.resolvedDataProjection, precision)
    },
    lineToViewProj (line, precision = COORD_PRECISION) {
      return transformLine(line, this.resolvedDataProjection, this.resolvedViewProjection, precision)
    },
    lineToDataProj (line, precision = COORD_PRECISION) {
      return transformLine(line, this.resolvedViewProjection, this.resolvedDataProjection, precision)
    },
    polygonToViewProj (polygon, precision = COORD_PRECISION) {
      return transformPolygon(polygon, this.resolvedDataProjection, this.resolvedViewProjection, precision)
    },
    polygonToDataProj (polygon, precision = COORD_PRECISION) {
      return transformPolygon(polygon, this.resolvedViewProjection, this.resolvedDataProjection, precision)
    },
    multiPointToViewProj (multiPoint, precision = COORD_PRECISION) {
      return transformMultiPoint(multiPoint, this.resolvedDataProjection, this.resolvedViewProjection, precision)
    },
    multiPointToDataProj (multiPoint, precision = COORD_PRECISION) {
      return transformMultiPoint(multiPoint, this.resolvedViewProjection, this.resolvedDataProjection, precision)
    },
    multiLineToViewProj (multiLine, precision = COORD_PRECISION) {
      return transformMultiLine(multiLine, this.resolvedDataProjection, this.resolvedViewProjection, precision)
    },
    multiLineToDataProj (multiLine, precision = COORD_PRECISION) {
      return transformMultiLine(multiLine, this.resolvedViewProjection, this.resolvedDataProjection, precision)
    },
    multiPolygonToViewProj (multiPolygon, precision = COORD_PRECISION) {
      return transformMultiPolygon(multiPolygon, this.resolvedDataProjection, this.resolvedViewProjection, precision)
    },
    multiPolygonToDataProj (multiPolygon, precision = COORD_PRECISION) {
      return transformMultiPolygon(multiPolygon, this.resolvedViewProjection, this.resolvedDataProjection, precision)
    },

    extentToViewProj (extent, precision = COORD_PRECISION) {
      return transformExtent(extent, this.resolvedDataProjection, this.resolvedViewProjection, precision)
    },
    extentToDataProj (extent, precision = COORD_PRECISION) {
      return transformExtent(extent, this.resolvedViewProjection, this.resolvedDataProjection, precision)
    },

    writeGeometryInDataProj (geometry, precision = COORD_PRECISION) {
      if (!geometry) return

      const key = this.makeGeometryKey(geometry, this.resolvedDataProjection, precision)
      let geometryJson = this._projTransformCache.get(key)
      if (geometryJson) {
        return geometryJson
      }
      geometryJson = writeGeoJsonGeometry(geometry, this.resolvedViewProjection, this.resolvedDataProjection, precision)
      this._projTransformCache.set(key, geometryJson)
      return geometryJson
    },
    writeGeometryInViewProj (geometry, precision = COORD_PRECISION) {
      if (!geometry) return

      const key = this.makeGeometryKey(geometry, this.resolvedViewProjection, precision)
      let geometryJson = this._projTransformCache.get(key)
      if (geometryJson) {
        return geometryJson
      }
      geometryJson = writeGeoJsonGeometry(geometry, this.resolvedViewProjection, this.resolvedViewProjection, precision)
      this._projTransformCache.set(key, geometryJson)
      return geometryJson
    },
    readGeometryInDataProj (geometry, precision = COORD_PRECISION) {
      if (!geometry) return

      return readGeoJsonGeometry(geometry, this.resolvedViewProjection, this.resolvedDataProjection, precision)
    },
    readGeometryInViewProj (geometry, precision = COORD_PRECISION) {
      if (!geometry) return

      return readGeoJsonGeometry(geometry, this.resolvedViewProjection, this.resolvedViewProjection, precision)
    },

    writeFeatureInDataProj (feature, precision = COORD_PRECISION) {
      if (!feature) return

      const key = this.makeFeatureKey(feature, this.resolvedDataProjection, precision)
      let featureJson = this._projTransformCache.get(key)
      if (featureJson) {
        return featureJson
      }
      featureJson = writeGeoJsonFeature(feature, this.resolvedViewProjection, this.resolvedDataProjection, precision)
      this._projTransformCache.set(key, featureJson)
      return featureJson
    },
    writeFeatureInViewProj (feature, precision = COORD_PRECISION) {
      if (!feature) return

      const key = this.makeFeatureKey(feature, this.resolvedViewProjection, precision)
      let featureJson = this._projTransformCache.get(key)
      if (featureJson) {
        return featureJson
      }
      featureJson = writeGeoJsonFeature(feature, this.resolvedViewProjection, this.resolvedViewProjection, precision)
      this._projTransformCache.set(key, featureJson)
      return featureJson
    },
    readFeatureInDataProj (feature, precision = COORD_PRECISION) {
      if (!feature) return

      return readGeoJsonFeature(feature, this.resolvedViewProjection, this.resolvedDataProjection, precision)
    },
    readFeatureInViewProj (feature, precision = COORD_PRECISION) {
      if (!feature) return

      return readGeoJsonFeature(feature, this.resolvedViewProjection, this.resolvedViewProjection, precision)
    },

    makeKey (object, projection, precision) {
      return serialize({ object, projection, precision })
    },
    makeGeometryKey (geometry, projection, precision) {
      return this.makeKey({
        type: getGeomType(geometry),
        coordinates: getGeomCoords(geometry),
      }, projection, precision)
    },
    makeFeatureKey (feature, projection, precision) {
      return this.makeKey({
        id: getFeatureId(feature),
        properties: getFeatureProperties(feature),
        geometry: getFeatureGeom(feature)
          ? this.makeGeometryKey(getFeatureGeom(feature), projection, precision)
          : null,
      }, projection, precision)
    },
  },
}
