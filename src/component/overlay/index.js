/**
 * @module overlay
 */
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
    Vue.component(Overlay.name, Overlay)
  },
}
