/** @module overlay */
import { pick } from '../../util/minilo'
import Overlay from './overlay.vue'

/**
 * @alias module:overlay
 */
export default {
  /**
   * @alias module:overlay/overlay
   */
  Overlay,
  /**
   * @param {Vue} Vue
   * @param {VueLayersOptions} [options]
   */
  install (Vue, options = {}) {
    options = pick(options, 'dataProjection')
    Object.assign(Overlay, options)

    Vue.component(Overlay.name, Overlay)
  },
}
