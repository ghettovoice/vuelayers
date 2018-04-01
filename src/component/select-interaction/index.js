/** @module select-interaction */
import { pick } from '../../util/minilo'
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
    options = pick(options, 'dataProjection')
    Object.assign(Interaction, options)

    Vue.component(Interaction.name, Interaction)
  },
}
