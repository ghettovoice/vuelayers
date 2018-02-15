/**
 * @module multi-line-string-geom
 */
import Geom from './geom.vue'

/**
 * @alias module:multi-line-string-geom
 */
export default {
  /**
   * @alias module:multi-line-string-geom/geom
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
