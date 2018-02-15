/**
 * Mixin with helpers for projection transforms between current view projection and global defined projection.
 * @module core/proj-transforms
 */
import { EPSG_3857 } from '../ol-ext/consts'
import * as projHelper from '../ol-ext/proj'
import * as geoJsonHelper from '../ol-ext/geojson'
import options from './options'

/**
 * @alias module:core/proj-transforms
 * @vueProto
 */
export default {
  mixins: [options],
  computed: {
    viewProjection () {
      return this.$view ? this.$view.getProjection().getCode() : EPSG_3857
    },
    bindProjection () {
      return this.globOption('bindToProj', this.viewProjection)
    },
  },
  methods: {
    pointToViewProj (point) {
      return projHelper.transformPoint(point, this.bindProjection, this.viewProjection)
    },
    pointToBindProj (point) {
      return projHelper.transformPoint(point, this.viewProjection, this.bindProjection)
    },
    lineToViewProj (line) {
      return projHelper.transformLine(line, this.bindProjection, this.viewProjection)
    },
    lineToBindProj (line) {
      return projHelper.transformLine(line, this.viewProjection, this.bindProjection)
    },
    polygonToViewProj (polygon) {
      return projHelper.transformPolygon(polygon, this.bindProjection, this.viewProjection)
    },
    polygonToBindProj (polygon) {
      return projHelper.transformPolygon(polygon, this.viewProjection, this.bindProjection)
    },
    multiPointToViewProj (multiPoint) {
      return projHelper.transformMultiPoint(multiPoint, this.bindProjection, this.viewProjection)
    },
    multiPointToBindProj (multiPoint) {
      return projHelper.transformMultiPoint(multiPoint, this.viewProjection, this.bindProjection)
    },
    multiLineToViewProj (multiLine) {
      return projHelper.transformMultiLine(multiLine, this.bindProjection, this.viewProjection)
    },
    multiLineToBindProj (multiLine) {
      return projHelper.transformMultiLine(multiLine, this.viewProjection, this.bindProjection)
    },
    multiPolygonToViewProj (multiPolygon) {
      return projHelper.transformMultiPolygon(multiPolygon, this.bindProjection, this.viewProjection)
    },
    multiPolygonToBindProj (multiPolygon) {
      return projHelper.transformMultiPolygon(multiPolygon, this.viewProjection, this.bindProjection)
    },

    extentToViewProj (extent) {
      return projHelper.transformExtent(extent, this.bindProjection, this.viewProjection)
    },
    extentToBindProj (extent) {
      return projHelper.transformExtent(extent, this.viewProjection, this.bindProjection)
    },

    writeGeometryInBindProj (geometry) {
      return geoJsonHelper.writeGeometry(geometry, this.viewProjection, this.bindProjection)
    },
    readGeometryInBindProj (geometry) {
      return geoJsonHelper.readGeometry(geometry, this.viewProjection, this.bindProjection)
    },

    writeFeatureInBindProj (feature) {
      return geoJsonHelper.writeFeature(feature, this.viewProjection, this.bindProjection)
    },
    readFeatureInBindProj (feature) {
      return geoJsonHelper.readFeature(feature, this.viewProjection, this.bindProjection)
    },
  },
}
