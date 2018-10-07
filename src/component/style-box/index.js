import { pick } from '../../util/minilo'
/**
 * @module style-box
 */
import Style from './style.vue'

/**
 * @alias module:style-box
 */
export default {
  /**
   * @alias module:style-box/style
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
