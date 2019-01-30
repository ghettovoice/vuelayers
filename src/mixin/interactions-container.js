import Collection from 'ol/Collection'
import Interaction from 'ol/interaction/Interaction'
import Vue from 'vue'
import { getInteractionId, identifyInteraction } from '../ol-ext/interaction'
import { instanceOf } from '../util/assert'

const methods = {
  /**
   * @param {module:ol/interaction/Interaction~Interaction|Vue} interaction
   * @return {void}
   */
  addInteraction (interaction) {
    interaction = interaction instanceof Vue ? interaction.$interaction : interaction
    instanceOf(interaction, Interaction)

    if (this.getInteractionById(getInteractionId(interaction)) == null) {
      identifyInteraction(interaction)
      this._interactionCollection.push(interaction)
      this.sortInteractions()
    }
  },
  /**
   * @param {module:ol/interaction/Interaction~Interaction|Vue} interaction
   * @return {void}
   */
  removeInteraction (interaction) {
    interaction = this.getInteractionById(getInteractionId(interaction))
    if (!interaction) return

    this._interactionCollection.remove(interaction)
    this.sortInteractions()
  },
  /**
   * @return {module:ol/interaction/Interaction~Interaction[]}
   */
  getInteractions () {
    return this._interactionCollection.toArray()
  },
  /**
   * @param {string|number} id
   * @return {module:ol/interaction/Interaction~Interaction|undefined}
   */
  getInteractionById (id) {
    return this._interactionCollection.getArray().find(interaction => {
      return getInteractionId(interaction) === id
    })
  },
  /**
   * @return {void}
   */
  sortInteractions (sorter) {
    sorter || (sorter = this.getDefaultInteractionsSorter())

    this._interactionCollection.getArray().sort(sorter)
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
    this._interactionCollection.clear()
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
     * @type {module:ol/Collection~Collection}
     * @private
     */
    this._interactionCollection = new Collection()
    // todo subscribe to collection
  },
}
