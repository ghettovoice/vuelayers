/**
 * @module osm-source
 */
import Source from './source.vue'

/**
 * @alias module:osm-source
 */
export default {
  /**
   * @alias module:osm-source/source
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
