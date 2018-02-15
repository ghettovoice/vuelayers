/**
 * @module mapbox-source
 */
import Source from './source.vue'

/**
 * @alias module:mapbox-source
 */
export default {
  /**
   * @alias module:mapbox-source/source
   */
  Source,
  /**
   * @param {Vue} Vue
   * @param {VueLayersOptions} [options]
   */
  install (Vue, options = {}) {
    Vue.component(Source.name, Source)
  },
}
