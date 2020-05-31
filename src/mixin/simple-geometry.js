import debounce from 'debounce-promise'
import { boundingExtent } from 'ol/extent'
import { findPointOnSurface, flatCoords, isEqualCoord, roundCoords, roundPointCoords, transforms } from '../ol-ext'
import { clonePlainObject, isEmpty, negate, pick } from '../util/minilo'
// import { makeWatchers } from '../util/vue-helpers'
import geometry from './geometry'
import { FRAME_TIME } from './ol-cmp'

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
      validator: negate(isEmpty),
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
  computed: {
    coordinatesDataProj () {
      return roundCoords(this.type, this.coordinates)
    },
    coordinatesViewProj () {
      return this.coordinatesToViewProj(this.coordinates)
    },
    extentDataProj () {
      return boundingExtent(flatCoords(this.type, this.coordinatesDataProj))
    },
    extentViewProj () {
      return this.extentToViewProj(this.extentDataProj)
    },
    currentCoordinatesDataProj () {
      if (this.rev && this.$geometry) {
        return this.getCoordinatesInternal()
      }

      return this.coordinatesDataProj
    },
    currentCoordinatesViewProj () {
      if (this.rev && this.$geometry) {
        return this.getCoordinatesInternal(true)
      }

      return this.coordinatesViewProj
    },
    currentPointDataProj () {
      if (!(this.rev && this.$geometry)) return

      return this.findPointOnSurfaceInternal()
    },
    currentPointViewProj () {
      if (!(this.rev && this.$geometry)) return

      return this.findPointOnSurfaceInternal(true)
    },
    // layoutUpCase () {
    //   return this.layout.toUpperCase()
    // },
  },
  watch: {
    coordinatesDataProj: {
      deep: true,
      async handler (value) {
        await this.setCoordinates(value)
      },
    },
    currentCoordinatesDataProj: {
      deep: true,
      handler: debounce(function (value) {
        if (isEqualCoord({
          coordinates: value,
          extent: boundingExtent(flatCoords(this.type, value)),
        }, {
          coordinates: this.coordinatesDataProj,
          extent: this.extentDataProj,
        })) return

        this.$emit('update:coordinates', clonePlainObject(value))
      }, FRAME_TIME),
    },
    async resolvedDataProjection () {
      await this.setCoordinates(this.coordinatesDataProj)
    },
    // ...makeWatchers([
    //   'layoutUpCase',
    // ], () => geometry.methods.scheduleRecreate),
  },
  methods: {
    ...pick(geometry.methods, [
      'beforeInit',
      'init',
      'deinit',
      'beforeMount',
      'mount',
      'unmount',
      'refresh',
      'scheduleRefresh',
      'remount',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'getServices',
      'subscribeAll',
      'resolveOlObject',
      'resolveGeometry',
    ]),
    /**
     * @returns {function}
     */
    getCoordinatesTransformFunction () {
      return transforms[this.type].transform
    },
    /**
     * @param {number[]} coordinates
     * @returns {Promise<number[]>}
     */
    coordinatesToDataProj (coordinates) {
      const transform = this.getCoordinatesTransformFunction()

      return transform(coordinates, this.viewProjection, this.resolvedDataProjection)
    },
    /**
     * @param {number[]} coordinates
     * @returns {Promise<number[]>}
     */
    coordinatesToViewProj (coordinates) {
      const transform = this.getCoordinatesTransformFunction()

      return transform(coordinates, this.resolvedDataProjection, this.viewProjection)
    },
    /**
     * @param {boolean} [viewProj=false]
     * @return {Promise<number[]>}
     */
    async getCoordinates (viewProj = false) {
      await this.resolveGeometry()

      return this.getCoordinatesInternal(viewProj)
    },
    /**
     * @param {boolean} [viewProj=false]
     * @return {number[]}
     * @protected
     */
    getCoordinatesInternal (viewProj = false) {
      if (viewProj) {
        return roundCoords(this.getTypeInternal(), this.$geometry.getCoordinates())
      }

      return this.coordinatesToDataProj(this.$geometry.getCoordinates())
    },
    /**
     * @param {number[]} coordinates
     * @param {boolean} [viewProj=false]
     */
    async setCoordinates (coordinates, viewProj = false) {
      await this.resolveGeometry()

      this.setCoordinatesInternal(coordinates, viewProj)
    },
    /**
     * @param {number[]} coordinates
     * @param {boolean} [viewProj=false]
     * @protected
     */
    setCoordinatesInternal (coordinates, viewProj = false) {
      coordinates = roundCoords(this.getTypeInternal(), coordinates)
      const currentCoordinates = this.getCoordinatesInternal(viewProj)

      if (isEqualCoord({
        coordinates,
        extent: boundingExtent(flatCoords(this.getTypeInternal(), coordinates)),
      }, {
        coordinates: currentCoordinates,
        extent: boundingExtent(flatCoords(this.getTypeInternal(), currentCoordinates)),
      })) return

      if (!viewProj) {
        coordinates = this.coordinatesToViewProj(coordinates)
      }

      this.$geometry.setCoordinates(coordinates)
    },
    /**
     * @param {boolean} [viewProj=false]
     * @returns {number[]>}
     */
    async getFirstCoordinate (viewProj = false) {
      const coordinate = (await this.resolveGeometry()).getFirstCoordinate()
      if (viewProj) {
        return roundPointCoords(coordinate)
      }

      return this.pointToDataProj(coordinate)
    },
    /**
     * @param {boolean} [viewProj=false]
     * @returns {Promise<number[]>}
     */
    async getLastCoordinate (viewProj = false) {
      const coordinate = (await this.resolveGeometry()).getLastCoordinate()
      if (viewProj) {
        return roundPointCoords(coordinate)
      }

      return this.pointToDataProj(coordinate)
    },
    /**
     * @returns {Promise<string>}
     */
    async getLayout () {
      return (await this.resolveGeometry()).getLayout()
    },
    /**
     * @param {boolean} [viewProj=false]
     * @return {Promise<number[]|undefined>}
     */
    async findPointOnSurface (viewProj = false) {
      await this.resolveGeometry()

      return this.findPointOnSurfaceInternal(viewProj)
    },
    /**
     * @param {boolean} [viewProj=false]
     * @return {number[]|undefined}
     * @protected
     */
    findPointOnSurfaceInternal (viewProj = false) {
      return findPointOnSurface({
        type: this.$geometry.getType(),
        coordinates: this.getCoordinatesInternal(viewProj),
      })
    },
  },
}
