/**
 * @module circle-style
 */
import Style from './style.vue'

/**
 * @alias module:circle-style
 */
export default {
  /**
   * @alias module:circle-style/style
   */
  Style,
  /**
   * @param {Vue} Vue
   * @param {VueLayersOptions} [options]
   */
  install (Vue, options = {}) {
    Vue.component(Style.name, Style)
  },
}
