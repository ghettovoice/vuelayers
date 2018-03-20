/**
 * @module text-style
 */
import Style from './style.vue'

/**
 * @alias module:text-style
 */
export default {
  /**
   * @alias module:text-style/style
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
