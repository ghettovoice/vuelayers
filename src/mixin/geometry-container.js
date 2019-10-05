import Vue from 'vue'
import { isPlainObject } from '../util/minilo'
import projTransforms from './proj-transforms'

export default {
  mixins: [projTransforms],
  methods: {
    /**
     * @return {Promise<{
     *     getGeometry: function(): module:ol/geom/Geometry~Geometry|undefined,
     *     setGeometry: function(module:ol/geom/Geometry~Geometry|undefined)
     *   }>|undefined}
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
     * @param {module:ol/geom/Geometry~Geometry|Vue|Object|undefined} geom
     * @return {Promise<void>}
     * @throws {AssertionError}
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
     * @return {Object}
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
