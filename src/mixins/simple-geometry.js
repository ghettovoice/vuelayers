import { boundingExtent as baseBoundingExtent } from 'ol/extent'
import GeometryLayout from 'ol/geom/GeometryLayout'
import GeometryType from 'ol/geom/GeometryType'
import { findPointOnSurface, isEqualCoord, roundCoords, roundPointCoords, transforms } from '../ol-ext'
import { assert, clonePlainObject, coalesce, isArray, isEmpty, isEqual, negate } from '../utils'
import geometry from './geometry'
import { makeChangeOrRecreateWatchers } from './ol-cmp'

/**
 * Base simple geometry with coordinates mixin.
 */
export default {
  mixins: [
    geometry,
  ],
  props: {
    // ol/geom/SimpleGeometry
    /**
     * @type {number[]} Coordinates in map data projection
     */
    coordinates: {
      type: Array,
      required: true,
      validator: /*#__PURE__*/negate(isEmpty),
    },
    // todo add support of coord layout
    // /**
    //  * @type {string}
    //  */
    // layout: {
    //   type: String,
    //   default: GeometryLayout.XY,
    //   validator: value => Object.values(GeometryLayout).includes(value.toUpperCase()),
    // },
  },
  data () {
    return {
      currentCoordinatesViewProj: clonePlainObject(this.coordinates),
    }
  },
  computed: {
    coordinatesDataProj () {
      return roundCoords(this.type, this.coordinates)
    },
    coordinatesViewProj () {
      return this.coordinatesToViewProj(this.coordinates)
    },
    currentCoordinatesDataProj () {
      return this.coordinatesToDataProj(this.currentCoordinatesViewProj)
    },
    pointDataProj () {
      return this.rev ? this.findPointOnSurface() : findPointOnSurface({
        type: this.type,
        coordinates: this.coordinatesDataProj,
      })
    },
    pointViewProj () {
      return this.rev ? this.findPointOnSurface(true) : findPointOnSurface({
        type: this.type,
        coordinates: this.coordinatesViewProj,
      })
    },
  },
  watch: {
    rev () {
      if (!this.$geometry) return

      if (!isEqualCoord({
        coordinates: this.currentCoordinatesViewProj,
        extent: boundingExtent(this.currentCoordinatesViewProj),
      }, {
        coordinates: this.$geometry.getCoordinates(),
        extent: this.$geometry.getExtent(),
      })) {
        this.currentCoordinatesViewProj = this.$geometry.getCoordinates()
      }
    },
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'coordinatesViewProj',
      'currentCoordinatesDataProj',
      'pointDataProj',
    ], [
      'coordinatesViewProj',
      'currentCoordinatesDataProj',
      'pointDataProj',
    ]),
  },
  created () {
    this.currentCoordinatesViewProj = clonePlainObject(this.coordinatesViewProj)
    this.extentViewProj = boundingExtent(this.currentCoordinatesViewProj)
  },
  methods: {
    /**
     * @returns {function}
     */
    getCoordinatesTransformFunction () {
      return transforms[this.getType()].transform
    },
    /**
     * @param {number[]} coordinates
     * @returns {Promise<number[]>}
     */
    coordinatesToDataProj (coordinates) {
      const transform = this.getCoordinatesTransformFunction()

      return transform(coordinates, this.resolvedViewProjection, this.resolvedDataProjection)
    },
    /**
     * @param {number[]} coordinates
     * @returns {Promise<number[]>}
     */
    coordinatesToViewProj (coordinates) {
      const transform = this.getCoordinatesTransformFunction()

      return transform(coordinates, this.resolvedDataProjection, this.resolvedViewProjection)
    },
    /**
     * @param {boolean} [viewProj=false]
     * @return {number[]}
     */
    getCoordinates (viewProj = false) {
      const coordinates = coalesce(this.$geometry?.getCoordinates(), this.currentCoordinatesViewProj)

      return viewProj ? roundCoords(this.getType(), coordinates) : this.coordinatesToDataProj(coordinates)
    },
    /**
     * @param {number[]} coordinates
     * @param {boolean} [viewProj=false]
     */
    setCoordinates (coordinates, viewProj = false) {
      assert(isArray(coordinates), 'Invalid coordinates')
      coordinates = viewProj ? roundCoords(this.getType(), coordinates) : this.coordinatesToViewProj(coordinates)
      const extent = boundingExtent(coordinates)

      if (!isEqualCoord({
        coordinates,
        extent,
      }, {
        coordinates: this.currentCoordinatesViewProj,
        extent: this.extentViewProj,
      })) {
        this.currentCoordinatesViewProj = coordinates
      }
      if (this.$geometry && !isEqualCoord({
        coordinates,
        extent,
      }, {
        coordinates: this.$geometry.getCoordinates(),
        extent: this.$geometry.getExtent(),
      })) {
        this.$geometry.setCoordinates(coordinates)
      }
    },
    /**
     * @param {boolean} [viewProj=false]
     * @returns {number[]>}
     */
    getFirstCoordinate (viewProj = false) {
      let coordinate
      if (this.$geometry) {
        coordinate = this.$geometry.getFirstCoordinate()
      } else {
        switch (this.getType()) {
          case GeometryType.POINT:
          case GeometryType.CIRCLE:
            coordinate = this.currentCoordinatesViewProj
            break
          case GeometryType.LINE_STRING:
          case GeometryType.MULTI_POINT:
            coordinate = this.currentCoordinatesViewProj[0]
            break
          case GeometryType.POLYGON:
          case GeometryType.MULTI_LINE_STRING:
            coordinate = this.currentCoordinatesViewProj[0][0]
            break
          case GeometryType.MULTI_POLYGON:
            coordinate = this.currentCoordinatesViewProj[0][0][0]
            break
        }
      }

      return viewProj ? roundPointCoords(coordinate) : this.pointToDataProj(coordinate)
    },
    /**
     * @param {boolean} [viewProj=false]
     * @returns {number[]}
     */
    getLastCoordinate (viewProj = false) {
      let coordinate
      if (this.$geometry) {
        coordinate = this.$geometry.getLastCoordinate()
      } else {
        let arr
        switch (this.getType()) {
          case GeometryType.POINT:
          case GeometryType.CIRCLE:
            coordinate = this.currentCoordinatesViewProj
            break
          case GeometryType.LINE_STRING:
          case GeometryType.MULTI_POINT:
            coordinate = this.currentCoordinatesViewProj[this.currentCoordinatesViewProj.length - 1]
            break
          case GeometryType.POLYGON:
          case GeometryType.MULTI_LINE_STRING:
            arr = this.currentCoordinatesViewProj[this.currentCoordinatesViewProj.length - 1]
            coordinate = arr[arr.length - 1]
            break
          case GeometryType.MULTI_POLYGON:
            arr = this.currentCoordinatesViewProj[this.currentCoordinatesViewProj.length - 1]
            arr = arr[arr.length - 1]
            coordinate = arr[arr.length - 1]
            break
        }
      }

      return viewProj ? roundPointCoords(coordinate) : this.pointToDataProj(coordinate)
    },
    /**
     * @returns {string}
     */
    getLayout () {
      return coalesce(this.$geometry?.getLayout(), GeometryLayout.XY)
    },
    /**
     * @param {boolean} [viewProj=false]
     * @return {number[]|undefined}
     */
    findPointOnSurface (viewProj = false) {
      return findPointOnSurface({
        type: this.getType(),
        coordinates: this.getCoordinates(viewProj),
      })
    },
    /**
     * @param {number[]} value
     * @protected
     */
    coordinatesViewProjChanged (value) {
      this.setCoordinates(value, true)
    },
    /**
     * @param {number[]} value
     * @protected
     */
    currentCoordinatesDataProjChanged (value) {
      if (isEqual(value, this.coordinatesDataProj)) return

      this.$emit('update:coordinates', clonePlainObject(value))
    },
    /**
     * @param {number[]} value
     * @param {number[]} prev
     * @protected
     */
    pointDataProjChanged (value, prev) {
      if (isEqual(value, prev)) return

      this.$emit('update:point', value?.slice())
    },
  },
}

function boundingExtent (coordinates) {
  if (!coordinates) return
  if (!isArray(coordinates[0])) {
    coordinates = [coordinates]
  }
  return baseBoundingExtent(coordinates)
}
