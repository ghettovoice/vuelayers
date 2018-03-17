/** @module snap-interaction */
import Interaction from './interaction.vue'

/**
 * @alias module:snap-interaction
 */
export default {
  /**
   * @alias module:snap-interaction/interaction
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
