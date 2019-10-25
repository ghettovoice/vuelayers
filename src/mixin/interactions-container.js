import Collection from 'ol/Collection'
import Interaction from 'ol/interaction/Interaction'
import Vue from 'vue'
import { merge as mergeObs } from 'rxjs/observable'
import { getInteractionId, getInteractionPriority, initializeInteraction } from '../ol-ext'
import { instanceOf } from '../util/assert'
import rxSubs from './rx-subs'
import identMap from './ident-map'
import { observableFromOlEvent } from '../rx-ext'

export default {
  mixins: [identMap, rxSubs],
  computed: {
    interactionIds () {
      if (!this.rev) return []

      return this.getInteractions().map(getInteractionId)
    },
    interactionsCollectionIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'interactions_collection')
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
        this.$interactionsCollection.push(interaction)
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

      this.$interactionsCollection.remove(interaction)
      this.sortInteractions()
    },
    /**
     * @return {Interaction[]}
     */
    getInteractions () {
      return this.$interactionsCollection.getArray()
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
      return this.$interactionsCollection.getArray().find(interaction => {
        return getInteractionId(interaction) === interactionId
      })
    },
    /**
     * @return {void}
     */
    sortInteractions (sorter) {
      sorter || (sorter = this.getDefaultInteractionsSorter())

      this.$interactionsCollection.getArray().sort(sorter)
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
      this.$interactionsCollection.clear()
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
    this._interactionsCollection = this.instanceFactoryCall(this.interactionsCollectionIdent, () => new Collection())

    this::defineServices()
    this::subscribeToCollectionEvents()
  },
}

function defineServices () {
  Object.defineProperties(this, {
    $interactionsCollection: {
      enumerable: true,
      get: this.getInteractionsCollection,
    },
  })
}

function subscribeToCollectionEvents () {
  const adds = observableFromOlEvent(this.$interactionsCollection, 'add')
  const removes = observableFromOlEvent(this.$interactionsCollection, 'remove')

  this.subscribeTo(mergeObs(adds, removes), ({ type, element }) => {
    ++this.rev

    this.$nextTick(() => {
      this.$emit(type + ':interaction', element)
    })
  })
}
