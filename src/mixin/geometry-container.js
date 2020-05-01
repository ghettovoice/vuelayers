import { isFunction, isPlainObject } from '../util/minilo'
import projTransforms from './proj-transforms'

/**
 * @typedef {module:ol/geom/Geometry~Geometry|module:ol/style/Style~GeometryFunction|Object} GeometryLike
 */
/**
 * @typedef {Object} GeometryTarget
 * @property {function(): module:ol/geom/Geometry~Geometry|module:ol/style/Style~GeometryFunction|undefined} getGeometry
 * @property {function(module:ol/geom/Geometry~Geometry|module:ol/style/Style~GeometryFunction|undefined): void} setGeometry
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
     * @return {Promise<GeometryTarget|undefined>}
     * @protected
     */
    getGeometryTarget () {
      throw new Error('Not implemented method: getGeometryTarget')
    },
    /**
     * @return {module:ol/geom/Geometry~Geometry|undefined}
     */
    getGeometry () {
      return this._geometry
    },
    /**
     * @param {GeometryLike|undefined} geom
     * @return {Promise<void>}
     */
    async setGeometry (geom) {
      let geomVm
      if (geom && isFunction(geom.resolveOlObject)) {
        geomVm = geom
        geom = await geom.resolveOlObject()
      } else if (isPlainObject(geom)) {
        geom = this.readGeometryInDataProj(geom)
      }

      const geomTarget = await this.getGeometryTarget()
      if (geomTarget && geom !== geomTarget.getGeometry()) {
        geomTarget.setGeometry(geom)
        this._geometry = geom
        this._geometryVm = geomVm || (geom?.vm && geom.vm[0])
      }
    },
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
      get: () => this._geometryVm,
    },
  })
}
