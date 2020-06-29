import LRU from 'lru-cache'
import {
  COORD_PRECISION,
  EPSG_3857, getFeatureId, getFeatureProperties, getGeomCoords, getGeomType,
  getMapDataProjection,
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
import { coalesce, serialize } from '../util'

/**
 * Mixin with helpers for projection transforms between current view projection and global defined projection.
 */
export default {
  computed: {
    /**
     * @return {module:ol/proj~ProjectionLike}
     */
    viewProjection () {
      if (this.rev && this.$viewVm) {
        return this.$viewVm.projection
      }
      return this.projection || EPSG_3857
    },
    /**
     * @return {module:ol/proj~ProjectionLike}
     */
    resolvedDataProjection () {
      return coalesce(
        this.dataProjection, // may or may not be present
        this.projection, // may or may not be present
        this.$mapVm?.resolvedDataProjection,
        this.$map && getMapDataProjection(this.$map),
        this.$options?.dataProjection,
        this.viewProjection,
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
      return transformPoint(point, this.resolvedDataProjection, this.viewProjection, precision)
    },
    pointToDataProj (point, precision = COORD_PRECISION) {
      return transformPoint(point, this.viewProjection, this.resolvedDataProjection, precision)
    },
    lineToViewProj (line, precision = COORD_PRECISION) {
      return transformLine(line, this.resolvedDataProjection, this.viewProjection, precision)
    },
    lineToDataProj (line, precision = COORD_PRECISION) {
      return transformLine(line, this.viewProjection, this.resolvedDataProjection, precision)
    },
    polygonToViewProj (polygon, precision = COORD_PRECISION) {
      return transformPolygon(polygon, this.resolvedDataProjection, this.viewProjection, precision)
    },
    polygonToDataProj (polygon, precision = COORD_PRECISION) {
      return transformPolygon(polygon, this.viewProjection, this.resolvedDataProjection, precision)
    },
    multiPointToViewProj (multiPoint, precision = COORD_PRECISION) {
      return transformMultiPoint(multiPoint, this.resolvedDataProjection, this.viewProjection, precision)
    },
    multiPointToDataProj (multiPoint, precision = COORD_PRECISION) {
      return transformMultiPoint(multiPoint, this.viewProjection, this.resolvedDataProjection, precision)
    },
    multiLineToViewProj (multiLine, precision = COORD_PRECISION) {
      return transformMultiLine(multiLine, this.resolvedDataProjection, this.viewProjection, precision)
    },
    multiLineToDataProj (multiLine, precision = COORD_PRECISION) {
      return transformMultiLine(multiLine, this.viewProjection, this.resolvedDataProjection, precision)
    },
    multiPolygonToViewProj (multiPolygon, precision = COORD_PRECISION) {
      return transformMultiPolygon(multiPolygon, this.resolvedDataProjection, this.viewProjection, precision)
    },
    multiPolygonToDataProj (multiPolygon, precision = COORD_PRECISION) {
      return transformMultiPolygon(multiPolygon, this.viewProjection, this.resolvedDataProjection, precision)
    },

    extentToViewProj (extent, precision = COORD_PRECISION) {
      return transformExtent(extent, this.resolvedDataProjection, this.viewProjection, precision)
    },
    extentToDataProj (extent, precision = COORD_PRECISION) {
      return transformExtent(extent, this.viewProjection, this.resolvedDataProjection, precision)
    },

    writeGeometryInDataProj (geometry, precision = COORD_PRECISION) {
      if (!geometry) return

      const key = this.makeGeometryKey(geometry, this.resolvedDataProjection, precision)
      let geometryJson = this._projTransformCache.get(key)
      if (geometryJson) {
        return geometryJson
      }
      geometryJson = writeGeoJsonGeometry(geometry, this.viewProjection, this.resolvedDataProjection, precision)
      this._projTransformCache.set(key, geometryJson)
      return geometryJson
    },
    writeGeometryInViewProj (geometry, precision = COORD_PRECISION) {
      if (!geometry) return

      const key = this.makeGeometryKey(geometry, this.viewProjection, precision)
      let geometryJson = this._projTransformCache.get(key)
      if (geometryJson) {
        return geometryJson
      }
      geometryJson = writeGeoJsonGeometry(geometry, this.viewProjection, this.viewProjection, precision)
      this._projTransformCache.set(key, geometryJson)
      return geometryJson
    },
    readGeometryInDataProj (geometry, precision = COORD_PRECISION) {
      if (!geometry) return

      return readGeoJsonGeometry(geometry, this.viewProjection, this.resolvedDataProjection, precision)
    },
    readGeometryInViewProj (geometry, precision = COORD_PRECISION) {
      if (!geometry) return

      return readGeoJsonGeometry(geometry, this.viewProjection, this.viewProjection, precision)
    },

    writeFeatureInDataProj (feature, precision = COORD_PRECISION) {
      if (!feature) return

      const key = this.makeFeatureKey(feature, this.resolvedDataProjection, precision)
      let featureJson = this._projTransformCache.get(key)
      if (featureJson) {
        return featureJson
      }
      featureJson = writeGeoJsonFeature(feature, this.viewProjection, this.resolvedDataProjection, precision)
      this._projTransformCache.set(key, featureJson)
      return featureJson
    },
    writeFeatureInViewProj (feature, precision = COORD_PRECISION) {
      if (!feature) return

      const key = this.makeFeatureKey(feature, this.viewProjection, precision)
      let featureJson = this._projTransformCache.get(key)
      if (featureJson) {
        return featureJson
      }
      featureJson = writeGeoJsonFeature(feature, this.viewProjection, this.viewProjection, precision)
      this._projTransformCache.set(key, featureJson)
      return featureJson
    },
    readFeatureInDataProj (feature, precision = COORD_PRECISION) {
      if (!feature) return

      return readGeoJsonFeature(feature, this.viewProjection, this.resolvedDataProjection, precision)
    },
    readFeatureInViewProj (feature, precision = COORD_PRECISION) {
      if (!feature) return

      return readGeoJsonFeature(feature, this.viewProjection, this.viewProjection, precision)
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
        geometry: feature.getGeometry()
          ? this.makeGeometryKey(feature.getGeometry(), projection, precision)
          : null,
      }, projection, precision)
    },
  },
}
