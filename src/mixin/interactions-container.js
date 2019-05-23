import Collection from 'ol/Collection'
import Interaction from 'ol/interaction/Interaction'
import Vue from 'vue'
import { merge as mergeObs } from 'rxjs/observable'
import { getInteractionId, getInteractionPriority, initializeInteraction } from '../ol-ext'
import { instanceOf } from '../util/assert'
import rxSubs from './rx-subs'
import { observableFromOlEvent } from '../rx-ext'

export default {
  mixins: [rxSubs],
  computed: {
    interactionIds () {
      if (!this.rev) return []

      return this.getInteractions().map(getInteractionId)
    },
  },
  methods: {
    /**
     * @param {Interaction|Vue} interaction
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
     * @param {Interaction|Vue} interaction
     * @return {void}
     */
    removeInteraction (interaction) {
      interaction = this.getInteractionById(getInteractionId(interaction))
      if (!interaction) return

      this._interactionsCollection.remove(interaction)
      this.sortInteractions()
    },
    /**
     * @return {Interaction[]}
     */
    getInteractions () {
      return this._interactionsCollection.getArray()
    },
    /**
     * @return {Collection<Interaction>>}
     */
    getInteractionsCollection () {
      return this._interactionsCollection
    },
    /**
     * @param {string|number} interactionId
     * @return {Interaction|undefined}
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
        let ap = getInteractionPriority(a) || 0
        let bp = getInteractionPriority(b) || 0
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
     * @type {Collection<Interaction>>}
     * @private
     */
    this._interactionsCollection = new Collection()

    const add = observableFromOlEvent(this._interactionsCollection, 'add')
    const remove = observableFromOlEvent(this._interactionsCollection, 'remove')
    const events = mergeObs(add, remove)

    this.subscribeTo(events, ({ type, element }) => {
      ++this.rev

      this.$emit(type + ':interaction', getInteractionId(element))
    })
  },
}
