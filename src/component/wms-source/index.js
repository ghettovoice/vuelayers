/**
 * @module wms-source
 */
import Source from './source.vue'

/**
 * @alias module:wms-source
 */
export default {
  /**
   * @alias module:wms-source/source
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
