import Vue from 'vue'
import { isPlainObject } from '../util/minilo'
import projTransforms from './proj-transforms'

export default {
  mixins: [projTransforms],
  methods: {
    /**
     * @return {{
     *     getGeometry: function(): module:ol/geom/Geometry~Geometry|undefined,
     *     setGeometry: function(module:ol/geom/Geometry~Geometry|undefined)
     *   }|undefined}
     * @protected
     */
    getGeometryTarget () {
      throw new Error('Not implemented method')
    },
    /**
     * @return {module:ol/geom/Geometry~Geometry|undefined}
     */
    getGeometry () {
      return this._geometry
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
    /**
     * @param {module:ol/geom/Geometry~Geometry|Vue|Object|undefined} geom
     * @return {void}
     * @throws {AssertionError}
     */
    setGeometry (geom) {
      if (geom instanceof Vue) {
        geom = geom.$geometry
      } else if (isPlainObject(geom)) {
        geom = this.readGeometryInDataProj(geom)
      }

      if (geom !== this._geometry) {
        /**
         * @type {module:ol/geom/Geometry~Geometry|undefined}
         * @private
         */
        this._geometry = geom
      }

      const geomTarget = this.getGeometryTarget()
      if (geomTarget && geom !== geomTarget.getGeometry()) {
        geomTarget.setGeometry(geom)
      }
    },
  },
}
