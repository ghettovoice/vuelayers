import { Geometry } from 'ol/geom'
import { isGeoJSONGeometry } from '../ol-ext'
import { assert, coalesce } from '../utils'
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
     * @return {GeometryTarget|undefined}
     * @protected
     */
    getGeometryTarget () {
      throw new Error(`${this.vmName} not implemented method: getGeometryTarget()`)
    },
    /**
     * @return {module:ol/geom/Geometry~Geometry|undefined}
     */
    getGeometry () {
      return coalesce(this.getGeometryTarget()?.getGeometry(), this._geometry)
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
     */
    setGeometry (geom, viewProj = false) {
      geom = geom?.$geometry || geom
      if (isGeoJSONGeometry(geom)) {
        if (viewProj) {
          geom = this.readGeometryInViewProj(geom)
        } else {
          geom = this.readGeometryInDataProj(geom)
        }
      }
      geom || (geom = undefined)
      assert(!geom || geom instanceof Geometry, 'Invalid geometry')

      const geomTarget = this.getGeometryTarget()
      if (geomTarget && geom !== geomTarget.getGeometry()) {
        geomTarget.setGeometry(geom)
        this.scheduleRefresh()
      }
      if (geom !== this._geometry) {
        this._geometry = geom
        this._geometryVm = geom?.vm && geom.vm[0]
        this.scheduleRefresh()
      }
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
