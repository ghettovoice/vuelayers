/** @module circle-geom */
import Geom from './geom.vue'

/**
 * @alias module:circle-geom
 */
export default {
  /**
   * @alias module:point-geom/geom
   */
  Geom,
  /**
   * @param {Vue} Vue
   * @param {VueLayersOptions} [option]
   */
  install (Vue, option = {}) {
    Vue.component(Geom.name, Geom)
  },
}
