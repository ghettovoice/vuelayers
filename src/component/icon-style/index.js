/**
 * @module icon-style
 */
import Style from './style.vue'

/**
 * @alias module:icon-style
 */
export default {
  /**
   * @alias module:icon-style/style
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
