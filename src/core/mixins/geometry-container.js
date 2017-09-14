import Vue from 'vue'
import { isPlainObject } from 'lodash/fp'
import * as assert from '../utils/assert'
import { geoJson } from '../ol-ext/index'

const methods = {
  /**
   * @return {{
   *     getGeometry: function(): ol.geom.Geometry|undefined,
   *     setGeometry: function(ol.geom.Geometry|undefined)
   *   }|undefined}
   * @protected
   */
  getGeometryTarget () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {ol.geom.Geometry|undefined}
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
   * @param {ol.geom.Geometry|Vue|GeoJSONGeometry|undefined} geom
   * @return {void}
   * @throws {AssertionError}
   */
  setGeometry (geom) {
    if (geom instanceof Vue) {
      geom = geom.$geometry
    } else if (isPlainObject(geom)) {
      assert.hasView(this)
      geom = geoJson.readGeometry(geom, this.$view.getProjection())
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
  methods,
  created () {
    /**
     * @type {ol.geom.Geometry|undefined}
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
  destroyed () {
    this._geometry = undefined
  },
}
