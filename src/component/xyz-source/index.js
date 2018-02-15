/**
 * @module xyz-source
 */
import Source from './source.vue'

/**
 * @alias module:xyz-source
 */
export default {
  /**
   * @alias module:xyz-source/source
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
