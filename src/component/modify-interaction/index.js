/** @module modify-interaction */
import Interaction from './interaction.vue'

/**
 * @alias module:modify-interaction
 */
export default {
  /**
   * @alias module:modify-interaction/interaction
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
