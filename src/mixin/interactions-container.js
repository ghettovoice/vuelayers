import Collection from 'ol/Collection'
import Interaction from 'ol/interaction/Interaction'
import Vue from 'vue'
import { getInteractionId, initializeInteraction } from '../ol-ext'
import { instanceOf } from '../util/assert'

export default {
  methods: {
    /**
     * @param {module:ol/interaction/Interaction~Interaction|Vue} interaction
     * @return {void}
     */
    addInteraction (interaction) {
      interaction = interaction instanceof Vue ? interaction.$interaction : interaction
      instanceOf(interaction, Interaction)

      if (this.getInteractionById(getInteractionId(interaction)) == null) {
        initializeInteraction(interaction)
        this._interactionsCollection.push(interaction)
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

      this._interactionsCollection.remove(interaction)
      this.sortInteractions()
    },
    /**
     * @return {module:ol/interaction/Interaction~Interaction[]}
     */
    getInteractions () {
      return this._interactionsCollection.toArray()
    },
    /**
     * @return {module:ol/Collection~Collection<module:ol/interaction/Interaction~Interaction>>}
     */
    getInteractionsCollection () {
      return this._interactionsCollection
    },
    /**
     * @param {string|number} interactionId
     * @return {module:ol/interaction/Interaction~Interaction|undefined}
     */
    getInteractionById (interactionId) {
      return this._interactionsCollection.getArray().find(interaction => {
        return getInteractionId(interaction) === interactionId
      })
    },
    /**
     * @return {void}
     */
    sortInteractions (sorter) {
      sorter || (sorter = this.getDefaultInteractionsSorter())

      this._interactionsCollection.getArray().sort(sorter)
    },
    /**
     * @return {function}
     * @protected
     */
    getDefaultInteractionsSorter () {
      // sort interactions by priority in asc order
      // the higher the priority, the earlier the interaction handles the event
      return (a, b) => {
        let ap = a.get('priority') || 0
        let bp = b.get('priority') || 0
        return ap === bp ? 0 : ap - bp
      }
    },
    /**
     * @return {void}
     */
    clearInteractions () {
      this._interactionsCollection.clear()
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
  },
  created () {
    /**
     * @type {module:ol/Collection~Collection<module:ol/interaction/Interaction~Interaction>>}
     * @private
     */
    this._interactionsCollection = new Collection()
    // todo subscribe to collection
  },
}
