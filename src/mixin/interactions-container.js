import Vue from 'vue'
import Interaction from 'ol/interaction/interaction'
import {instanceOf} from '../util/assert'

const methods = {
  /**
   * @return {{
   *     hasInteraction: function(ol.interaction.Interaction): bool,
   *     addInteraction: function(ol.interaction.Interaction): void,
   *     removeInteraction: function(ol.interaction.Interaction): void
   *   }|undefined}
   * @protected
   */
  getInteractionsTarget () {
    throw new Error('Not implemented method')
  },
  /**
   * @param {ol.interaction.Interaction|Vue} interaction
   * @return {void}
   */
  addInteraction (interaction) {
    interaction = interaction instanceof Vue ? interaction.$interaction : interaction
    instanceOf(interaction, Interaction)

    if (!this._interactions[interaction.get('id')]) {
      this._interactions[interaction.get('id')] = interaction
    }

    const interactionsTarget = this.getInteractionsTarget()
    if (interactionsTarget && !interactionsTarget.hasInteraction(interaction)) {
      interactionsTarget.addInteraction(interaction)
    }
  },
  /**
   * @param {ol.interaction.Interaction|Vue} interaction
   * @return {void}
   */
  removeInteraction (interaction) {
    interaction = interaction instanceof Vue ? interaction.$interaction : interaction

    if (!interaction) return

    delete this._interactions[interaction.get('id')]

    const interactionsTarget = this.getInteractionsTarget()
    if (interactionsTarget && interactionsTarget.hasInteraction(interaction)) {
      interactionsTarget.removeInteraction(interaction)
    }
  },
  /**
   * @return {ol.interaction.Interaction[]}
   */
  getInteractions () {
    return Object.values(this._interactions)
  },
  /**
   * @param {string|number} id
   * @return {ol.interaction.Interaction|undefined}
   */
  getInteractionById (id) {
    return this._interactions[id]
  },
  /**
   * @returns {Object}
   * @protected
   */
  getServices () {
    const vm = this

    return {
      get interactionsContainer () { return vm },
    }
  },
}

export default {
  methods,
  created () {
    /**
     * @type {Object<string, ol.interaction.Interaction>}
     * @private
     */
    this._interactions = Object.create(null)
  },
  destroyed () {
    this._interactions = Object.create(null)
  },
}
