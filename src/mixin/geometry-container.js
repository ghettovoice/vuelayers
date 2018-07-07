import Vue from 'vue'
import { isPlainObject } from '../util/minilo'
import projTransforms from './proj-transforms'

const methods = {
  /**
   * @return {{
   *     getGeometry: function(): Geometry|undefined,
   *     setGeometry: function(Geometry|undefined)
   *   }|undefined}
   * @protected
   */
  getGeometryTarget () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {Geometry|undefined}
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
   * @param {Geometry|Vue|Object|undefined} geom
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
      this._geometry = geom
    }

    const geomTarget = this.getGeometryTarget()
    if (geomTarget && geom !== geomTarget.getGeometry()) {
      geomTarget.setGeometry(geom)
    }
  },
}

export default {
  mixins: [projTransforms],
  methods,
  created () {
    /**
     * @type {Geometry|undefined}
     * @private
     */
    this._geometry = undefined

    Object.defineProperties(this, {
      $geometry: {
        enumerable: true,
        get: this.getGeometry,
      },
    })
  },
}
