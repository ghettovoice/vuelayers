import { EPSG_3857 } from '../ol-ext/consts'
import { readGeoJsonFeature, readGeoJsonGeometry, writeGeoJsonFeature, writeGeoJsonGeometry } from '../ol-ext/geojson'
import {
  transformExtent,
  transformLine,
  transformMultiLine,
  transformMultiPoint,
  transformMultiPolygon,
  transformPoint,
  transformPolygon,
} from '../ol-ext/proj'
import { coalesce } from '../util/minilo'

/**
 * Mixin with helpers for projection transforms between current view projection and global defined projection.
 */

export default {
  computed: {
    /**
     * @return {ProjectionLike}
     */
    viewProjection () {
      if (this.rev && this.$view) {
        return this.$view.getProjection().getCode()
      }
      return EPSG_3857
    },
    /**
     * @return {ProjectionLike}
     */
    resolvedDataProjection () {
      return coalesce(
        this.dataProjection, // may or may not be present
        this.projection, // may or may not be present
        this.$map && this.$map.get('dataProjection'),
        this.$options.dataProjection,
        this.viewProjection,
      )
    },
  },
  methods: {
    pointToViewProj (point) {
      return transformPoint(point, this.resolvedDataProjection, this.viewProjection)
    },
    pointToDataProj (point) {
      return transformPoint(point, this.viewProjection, this.resolvedDataProjection)
    },
    lineToViewProj (line) {
      return transformLine(line, this.resolvedDataProjection, this.viewProjection)
    },
    lineToDataProj (line) {
      return transformLine(line, this.viewProjection, this.resolvedDataProjection)
    },
    polygonToViewProj (polygon) {
      return transformPolygon(polygon, this.resolvedDataProjection, this.viewProjection)
    },
    polygonToDataProj (polygon) {
      return transformPolygon(polygon, this.viewProjection, this.resolvedDataProjection)
    },
    multiPointToViewProj (multiPoint) {
      return transformMultiPoint(multiPoint, this.resolvedDataProjection, this.viewProjection)
    },
    multiPointToDataProj (multiPoint) {
      return transformMultiPoint(multiPoint, this.viewProjection, this.resolvedDataProjection)
    },
    multiLineToViewProj (multiLine) {
      return transformMultiLine(multiLine, this.resolvedDataProjection, this.viewProjection)
    },
    multiLineToDataProj (multiLine) {
      return transformMultiLine(multiLine, this.viewProjection, this.resolvedDataProjection)
    },
    multiPolygonToViewProj (multiPolygon) {
      return transformMultiPolygon(multiPolygon, this.resolvedDataProjection, this.viewProjection)
    },
    multiPolygonToDataProj (multiPolygon) {
      return transformMultiPolygon(multiPolygon, this.viewProjection, this.resolvedDataProjection)
    },

    extentToViewProj (extent) {
      return transformExtent(extent, this.resolvedDataProjection, this.viewProjection)
    },
    extentToDataProj (extent) {
      return transformExtent(extent, this.viewProjection, this.resolvedDataProjection)
    },

    writeGeometryInDataProj (geometry) {
      return writeGeoJsonGeometry(geometry, this.viewProjection, this.resolvedDataProjection)
    },
    writeGeometryInViewProj (geometry) {
      return writeGeoJsonGeometry(geometry)
    },
    readGeometryInDataProj (geometry) {
      return readGeoJsonGeometry(geometry, this.viewProjection, this.resolvedDataProjection)
    },

    writeFeatureInDataProj (feature) {
      return writeGeoJsonFeature(feature, this.viewProjection, this.resolvedDataProjection)
    },
    writeFeatureInViewProj (feature) {
      return writeGeoJsonFeature(feature)
    },
    readFeatureInDataProj (feature) {
      return readGeoJsonFeature(feature, this.viewProjection, this.resolvedDataProjection)
    },
  },
}
