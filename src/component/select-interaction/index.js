/**
 * @module select-interaction
 */
import Interaction from './interaction.vue'

/**
 * @alias module:select-interaction
 */
export default {
  /**
   * @alias module:select-interaction/interaction
   */
  Interaction,
  /**
   * @param {Vue} Vue
   * @param {VueLayersOptions} [options]
   */
  install (Vue, options = {}) {
    Vue.component(Interaction.name, Interaction)
  },
}
