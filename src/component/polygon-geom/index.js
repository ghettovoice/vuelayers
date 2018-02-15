/**
 * @module polygon-geom
 */
import Geom from './geom.vue'

/**
 * @alias module:polygon-geom
 */
export default {
  /**
   * @alias module:polygon-geom/geom
   */
  Geom,
  /**
   * @param {Vue} Vue
   * @param {VueLayersOptions} [options]
   */
  install (Vue, options = {}) {
    Vue.component(Geom.name, Geom)
  },
}
