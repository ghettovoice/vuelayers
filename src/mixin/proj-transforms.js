/**
 * Mixin with helpers for projection transforms between current view projection and global defined projection.
 * @module mixin/proj-transforms
 */
import { EPSG_3857 } from '../ol-ext/consts'
import { readFeature, readGeometry, writeFeature, writeGeometry } from '../ol-ext/geojson'
import {
  transformExtent,
  transformLine,
  transformMultiLine,
  transformMultiPoint,
  transformMultiPolygon,
  transformPoint,
  transformPolygon,
} from '../ol-ext/proj'
import options from './options'

/**
 * @alias module:mixin/proj-transforms
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
      return transformPoint(point, this.bindProjection, this.viewProjection)
    },
    pointToBindProj (point) {
      return transformPoint(point, this.viewProjection, this.bindProjection)
    },
    lineToViewProj (line) {
      return transformLine(line, this.bindProjection, this.viewProjection)
    },
    lineToBindProj (line) {
      return transformLine(line, this.viewProjection, this.bindProjection)
    },
    polygonToViewProj (polygon) {
      return transformPolygon(polygon, this.bindProjection, this.viewProjection)
    },
    polygonToBindProj (polygon) {
      return transformPolygon(polygon, this.viewProjection, this.bindProjection)
    },
    multiPointToViewProj (multiPoint) {
      return transformMultiPoint(multiPoint, this.bindProjection, this.viewProjection)
    },
    multiPointToBindProj (multiPoint) {
      return transformMultiPoint(multiPoint, this.viewProjection, this.bindProjection)
    },
    multiLineToViewProj (multiLine) {
      return transformMultiLine(multiLine, this.bindProjection, this.viewProjection)
    },
    multiLineToBindProj (multiLine) {
      return transformMultiLine(multiLine, this.viewProjection, this.bindProjection)
    },
    multiPolygonToViewProj (multiPolygon) {
      return transformMultiPolygon(multiPolygon, this.bindProjection, this.viewProjection)
    },
    multiPolygonToBindProj (multiPolygon) {
      return transformMultiPolygon(multiPolygon, this.viewProjection, this.bindProjection)
    },

    extentToViewProj (extent) {
      return transformExtent(extent, this.bindProjection, this.viewProjection)
    },
    extentToBindProj (extent) {
      return transformExtent(extent, this.viewProjection, this.bindProjection)
    },

    writeGeometryInBindProj (geometry) {
      return writeGeometry(geometry, this.viewProjection, this.bindProjection)
    },
    readGeometryInBindProj (geometry) {
      return readGeometry(geometry, this.viewProjection, this.bindProjection)
    },

    writeFeatureInBindProj (feature) {
      return writeFeature(feature, this.viewProjection, this.bindProjection)
    },
    readFeatureInBindProj (feature) {
      return readFeature(feature, this.viewProjection, this.bindProjection)
    },
  },
}
