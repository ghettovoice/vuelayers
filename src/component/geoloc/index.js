/**
 * @module geoloc
 */
import Geoloc from './geoloc.vue'

/**
 * @alias module:geoloc
 */
export default {
  /**
   * @alias module:geoloc/geoloc
   */
  Geoloc,
  /**
   * @param {Vue} Vue
   * @param {VueLayersOptions} [options]
   */
  install (Vue, options = {}) {
    Vue.component(Geoloc.name, Geoloc)
  },
}
