import Vue from 'vue'
import { isPlainObject } from '../util/minilo'
import projTransforms from './proj-transforms'

/**
 * @typedef {module:ol/geom/Geometry~Geometry|Vue|Object} GeometryLike
 */
/**
 * @typedef {Object} GeometryTarget
 * @property {function(): module:ol/geom/Geometry~Geometry|undefined} getGeometry
 * @property {function(module:ol/geom/Geometry~Geometry|undefined): void} setGeometry
 */

/**
 * Geometry container
 */
export default {
  mixins: [projTransforms],
  methods: {
    /**
     * @return {Promise<GeometryTarget|undefined>}
     * @protected
     */
    getGeometryTarget () {
      throw new Error('Not implemented method')
    },
    /**
     * @return {Promise<module:ol/geom/Geometry~Geometry|undefined>}
     */
    async getGeometry () {
      return (await this.getGeometryTarget()).getGeometry()
    },
    /**
     * @param {GeometryLike|undefined} geom
     * @return {Promise<void>}
     */
    async setGeometry (geom) {
      if (geom instanceof Vue) {
        geom = await geom.resolveOlObject()
      } else if (isPlainObject(geom)) {
        geom = this.readGeometryInDataProj(geom)
      }

      const geomTarget = await this.getGeometryTarget()
      if (geomTarget && geom !== geomTarget.getGeometry()) {
        geomTarget.setGeometry(geom)
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
