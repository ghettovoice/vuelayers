import {
  COORD_PRECISION,
  EPSG_3857,
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
import { coalesce } from '../utils'

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
        this.viewProjection, // may or may not be present
        EPSG_3857,
      )
    },
    /**
     * @return {module:ol/proj~ProjectionLike}
     */
    resolvedDataProjection () {
      return coalesce(
        this.dataProjection, // may or may not be present
        this.$options?.dataProjection, // may or may not be present
        this.resolvedViewProjection,
      )
    },
  },
  watch: {
    resolvedViewProjection (...args) {
      return this.resolvedViewProjectionChanged(...args)
    },
    resolvedDataProjection (...args) {
      return this.resolvedDataProjectionChanged(...args)
    },
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
      return writeGeoJsonGeometry(geometry, this.resolvedViewProjection, this.resolvedDataProjection, precision)
    },
    writeGeometryInViewProj (geometry, precision = COORD_PRECISION) {
      return writeGeoJsonGeometry(geometry, this.resolvedViewProjection, this.resolvedViewProjection, precision)
    },
    readGeometryInDataProj (geometry, precision = COORD_PRECISION) {
      return readGeoJsonGeometry(geometry, this.resolvedViewProjection, this.resolvedDataProjection, precision)
    },
    readGeometryInViewProj (geometry, precision = COORD_PRECISION) {
      return readGeoJsonGeometry(geometry, this.resolvedViewProjection, this.resolvedViewProjection, precision)
    },

    writeFeatureInDataProj (feature, precision = COORD_PRECISION) {
      return writeGeoJsonFeature(feature, this.resolvedViewProjection, this.resolvedDataProjection, precision)
    },
    writeFeatureInViewProj (feature, precision = COORD_PRECISION) {
      return writeGeoJsonFeature(feature, this.resolvedViewProjection, this.resolvedViewProjection, precision)
    },
    readFeatureInDataProj (feature, precision = COORD_PRECISION) {
      return readGeoJsonFeature(feature, this.resolvedViewProjection, this.resolvedDataProjection, precision)
    },
    readFeatureInViewProj (feature, precision = COORD_PRECISION) {
      return readGeoJsonFeature(feature, this.resolvedViewProjection, this.resolvedViewProjection, precision)
    },
    /**
     * @param {string} value
     * @param {string} prev
     * @protected
     */
    resolvedViewProjectionChanged (value, prev) {
      if (value === prev) return

      this.$emit('update:viewProjection', value)
    },
    /**
     * @param {string} value
     * @param {string} prev
     * @protected
     */
    resolvedDataProjectionChanged (value, prev) {
      if (value === prev) return

      this.$emit('update:dataProjection', value)
    },
  },
}
