import { pick } from '../../util/minilo'
import Style from './style.vue'

/**
 * @alias module:fill-style
 */
export default {
  /**
   * @alias module:fill-style/style
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
