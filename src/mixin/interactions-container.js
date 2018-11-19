import Interaction from 'ol/interaction/Interaction'
import Vue from 'vue'
import { instanceOf } from '../util/assert'

const methods = {
  /**
   * @return {IndexedCollectionAdapter}
   * @protected
   */
  getInteractionsTarget () {
    throw new Error('Not implemented method')
  },
  /**
   * @param {Interaction|Vue} interaction
   * @return {void}
   */
  addInteraction (interaction) {
    interaction = interaction instanceof Vue ? interaction.$interaction : interaction
    instanceOf(interaction, Interaction)

    if (this.getInteractionsTarget().has(interaction) === false) {
      this.getInteractionsTarget().add(interaction)
      this.sortInteractions()
    }
  },
  /**
   * @param {Interaction|Vue} interaction
   * @return {void}
   */
  removeInteraction (interaction) {
    interaction = interaction instanceof Vue ? interaction.$interaction : interaction

    if (!interaction) return

    if (this.getInteractionsTarget().has(interaction)) {
      this.getInteractionsTarget().remove(interaction)
      this.sortInteractions()
    }
  },
  /**
   * @return {Interaction[]}
   */
  getInteractions () {
    return this.getInteractionsTarget().elements
  },
  /**
   * @param {string|number} id
   * @return {Interaction|undefined}
   */
  getInteractionById (id) {
    return this.getInteractionsTarget().findByKey(id)
  },
  /**
   * @return {void}
   */
  sortInteractions (sorter) {
    sorter || (sorter = this.getDefaultInteractionsSorter())
    this.getInteractionsTarget().sort(sorter)
  },
  /**
   * @return {function}
   * @protected
   */
  getDefaultInteractionsSorter () {
    return () => 0
  },
  /**
   * @return {void}
   */
  clearInteractions () {
    this.getInteractionsTarget().clear()
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
}
