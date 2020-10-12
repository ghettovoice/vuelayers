import debounce from 'debounce-promise'
import { findPointOnSurface, isGeoJSONGeometry } from '../ol-ext'
import { clonePlainObject, isEqual, isFunction } from '../utils'
import { FRAME_TIME } from './ol-cmp'
import projTransforms from './proj-transforms'

/**
 * @typedef {Geometry|Object} GeometryLike
 */
/**
 * @typedef {Object} GeometryTarget
 * @property {function(): Geometry|undefined} getGeometry
 * @property {function(Geometry|undefined): void} setGeometry
 */

/**
 * Geometry container
 */
export default {
  mixins: [
    projTransforms,
  ],
  computed: {
    currentGeometryDataProj () {
      if (!(this.rev && this.$geometry)) return

      return this.writeGeometryInDataProj(this.$geometry)
    },
    currentGeometryViewProj () {
      if (!(this.rev && this.$geometry)) return

      return this.writeGeometryInViewProj(this.$geometry)
    },
    currentPointDataProj () {
      if (!this.currentPointViewProj) return

      return this.pointToDataProj(this.currentPointViewProj)
    },
    currentPointViewProj () {
      if (!(this.rev && this.$geometry)) return

      return findPointOnSurface(this.$geometry)
    },
  },
  watch: {
    currentGeometryDataProj: {
      deep: true,
      handler: /*#__PURE__*/debounce(function (value, prev) {
        if (isEqual(value, prev)) return

        this.$emit('update:geometry', value && clonePlainObject(value))
      }, FRAME_TIME),
    },
  },
  created () {
    this._geometry = undefined
    this._geometryVm = undefined

    this::defineService()
  },
  methods: {
    /**
     * @returns {{readonly geometryContainer: Object}}
     * @protected
     */
    getServices () {
      const vm = this

      return {
        get geometryContainer () { return vm },
      }
    },
    /**
     * @return {Promise<GeometryTarget|undefined>}
     * @protected
     */
    getGeometryTarget () {
      throw new Error(`${this.vmName} not implemented method: getGeometryTarget()`)
    },
    /**
     * @return {module:ol/geom/Geometry~Geometry|undefined}
     */
    getGeometry () {
      return this._geometry
    },
    /**
     * @return {Object}
     */
    getGeometryVm () {
      return this._geometryVm
    },
    /**
     * @param {GeometryLike|undefined} geom
     * @param {boolean} [viewProj=false]
     * @return {Promise<void>}
     */
    async setGeometry (geom, viewProj = false) {
      if (isFunction(geom?.resolveOlObject)) {
        geom = await geom.resolveOlObject()
      } else if (isGeoJSONGeometry(geom)) {
        if (viewProj) {
          geom = this.readGeometryInViewProj(geom)
        } else {
          geom = this.readGeometryInDataProj(geom)
        }
      }
      geom || (geom = undefined)

      if (geom === this._geometry) return

      const geomTarget = await this.getGeometryTarget()
      if (!geomTarget) return

      this._geometry = geom
      this._geometryVm = geom?.vm && geom.vm[0]
      await geomTarget.setGeometry(geom)
    },
  },
}

function defineService () {
  Object.defineProperties(this, {
    $geometry: {
      enumerable: true,
      get: this.getGeometry,
    },
    $geometryVm: {
      enumerable: true,
      get: this.getGeometryVm,
    },
  })
}
