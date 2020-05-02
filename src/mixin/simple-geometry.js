import debounce from 'debounce-promise'
import { boundingExtent } from 'ol/extent'
import { findPointOnSurface, flatCoords, isEqualCoord, roundCoords, transforms } from '../ol-ext'
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
        return this.getCoordinatesSync()
      }

      return this.coordinatesDataProj
    },
    currentCoordinatesViewProj () {
      if (this.rev && this.$geometry) {
        return this.getCoordinatesSync(true)
      }

      return this.coordinatesViewProj
    },
    currentPointDataProj () {
      if (!(this.rev && this.$geometry)) return

      return this.findPointOnSurfaceSync()
    },
    currentPointViewProj () {
      if (!(this.rev && this.$geometry)) return

      return this.findPointOnSurfaceSync(true)
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
     * @return {Promise<number[]>}
     */
    async getCoordinates () {
      await this.resolveGeometry()

      return this.getCoordinatesSync()
    },
    getCoordinatesSync (viewProj = false) {
      if (viewProj) {
        return roundCoords(this.$geometry.getType(), this.$geometry.getCoordinates())
      }

      return this.coordinatesToDataProj(this.$geometry.getCoordinates())
    },
    /**
     * @param {number[]} coordinates
     */
    async setCoordinates (coordinates) {
      await this.resolveGeometry()

      this.setCoordinatesSync(coordinates)
    },
    setCoordinatesSync (coordinates) {
      coordinates = roundCoords(this.type, coordinates)
      const currentCoordinates = this.getCoordinatesSync()

      if (isEqualCoord({
        coordinates,
        extent: boundingExtent(flatCoords(this.type, coordinates)),
      }, {
        coordinates: currentCoordinates,
        extent: boundingExtent(flatCoords(this.type, currentCoordinates)),
      })) return

      this.$geometry.setCoordinates(this.coordinatesToViewProj(coordinates))
    },
    /**
     * @returns {number[]>}
     */
    async getFirstCoordinate () {
      const coordinate = (await this.resolveGeometry()).getFirstCoordinate()
      if (!coordinate) return

      return this.pointToDataProj(coordinate)
    },
    /**
     * @returns {Promise<number[]>}
     */
    async getLastCoordinate () {
      const coordinate = (await this.resolveGeometry()).getLastCoordinate()
      if (!coordinate) return

      return this.pointToDataProj(coordinate)
    },
    /**
     * @returns {Promise<string>}
     */
    async getCoordinatesLayout () {
      return (await this.resolveGeometry()).getLayout()
    },
    async findPointOnSurface () {
      await this.resolveGeometry()

      return this.findPointOnSurfaceSync()
    },
    findPointOnSurfaceSync (viewProj = false) {
      return findPointOnSurface({
        type: this.$geometry.getType(),
        coordinates: this.getCoordinatesSync(viewProj),
      })
    },
  },
}
