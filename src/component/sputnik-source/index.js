/**
 * @module sputnik-source
 */
import Source from './source.vue'

/**
 * @alias module:sputnik-source
 */
export default {
  /**
   * @alias module:sputnik-source/source
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
