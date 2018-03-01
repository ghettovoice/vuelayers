/**
 * @module style-func
 */
import Style from './style.vue'

/**
 * @alias module:style-func
 */
export default {
  /**
   * @alias module:style-func/style
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
