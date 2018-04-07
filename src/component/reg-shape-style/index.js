import { pick } from '../../util/minilo'

/**
 * @module reg-shape-style
 */
import Style from './style.vue'

/**
 * @alias module:reg-shape-style
 */
export default {
  /**
   * @alias module:reg-shape-style/style
   */
  Style,
  /**
   * @param {Vue} Vue
   * @param {VueLayersOptions} [options]
   */
  install (Vue, options = {}) {
    options = pick(options, 'dataProjection')
    Object.assign(Style, options)

    Vue.component(Style.name, Style)
  },
}
