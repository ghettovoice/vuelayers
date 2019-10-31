import { Collection } from 'ol'
import { defaults as createDefaultInteractions, Interaction } from 'ol/interaction'
import { merge as mergeObs } from 'rxjs/observable'
import { getInteractionId, getInteractionPriority, initializeInteraction } from '../ol-ext'
import { obsFromOlEvent } from '../rx-ext'
import { instanceOf } from '../util/assert'
import { isArray, isFunction, isPlainObject, map } from '../util/minilo'
import identMap from './ident-map'
import rxSubs from './rx-subs'

/**
 * @typedef {module:ol/interaction/Interaction~Interaction|Object} InteractionLike
 */

/**
 * Interactions container
 */
export default {
  mixins: [
    identMap,
    rxSubs,
  ],
  computed: {
    /**
     * @returns {string[]}
     */
    interactionIds () {
      if (!this.rev) return []

      return this.getInteractions().map(getInteractionId)
    },
    /**
     * @returns {string|undefined}
     */
    interactionsCollectionIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'interactions_collection')
    },
  },
  watch: {
    interactionsCollectionIdent (value, prevValue) {
      if (value && prevValue) {
        this.moveInstance(value, prevValue)
      } else if (value && !prevValue && this.$interactionsCollection) {
        this.setInstance(value, this.$interactionsCollection)
      } else if (!value && prevValue) {
        this.unsetInstance(prevValue)
      }
    },
  },
  created () {
    /**
     * @type {module:ol/Collection~Collection<module:ol/interaction/Interaction~Interaction>}
     * @private
     */
    this._interactionsCollection = this.instanceFactoryCall(this.interactionsCollectionIdent, () => new Collection())

    this::defineServices()
    this::subscribeToCollectionEvents()
  },
  methods: {
    /**
     * @param {InteractionLike[]|module:ol/Collection~Collection<InteractionLike>} defaultInteractions
     * @returns {Promise<void>}
     */
    async initDefaultInteractions (defaultInteractions) {
      this.clearInteractions()

      let interactions
      if (isArray(defaultInteractions) || defaultInteractions instanceof Collection) {
        interactions = defaultInteractions
      } else if (defaultInteractions !== false) {
        interactions = createDefaultInteractions(
          isPlainObject(defaultInteractions)
            ? this.defaultInteractions
            : undefined,
        )
      }
      if (interactions) {
        await this.addInteractions(interactions)
      }
    },
    /**
     * @param {InteractionLike} interaction
     * @return {void}
     */
    async addInteraction (interaction) {
      initializeInteraction(interaction)

      if (isFunction(interaction.resolveOlObject)) {
        interaction = await interaction.resolveOlObject()
      }

      instanceOf(interaction, Interaction)

      if (this.getInteractionById(getInteractionId(interaction)) == null) {
        this.$interactionsCollection.push(interaction)
        this.sortInteractions()
      }
    },
    /**
     * @param {InteractionLike[]|module:ol/Collection~Collection<InteractionLike>} interactions
     * @returns {Promise<void>}
     */
    async addInteractions (interactions) {
      await Promise.all(map(interactions, ::this.addInteraction))
    },
    /**
     * @param {InteractionLike} interaction
     * @return {void}
     */
    async removeInteraction (interaction) {
      if (isFunction(interaction.resolveOlObject)) {
        interaction = await interaction.resolveOlObject()
      }

      interaction = this.getInteractionById(getInteractionId(interaction))
      if (!interaction) return

      this.$interactionsCollection.remove(interaction)
      this.sortInteractions()
    },
    /**
     * @param {InteractionLike[]|module:ol/Collection~Collection<InteractionLike>} interactions
     * @returns {Promise<void>}
     */
    async removeInteractions (interactions) {
      await Promise.all(map(interactions, ::this.removeInteraction))
    },
    /**
     * @return {module:ol/interaction/Interaction~Interaction[]}
     */
    getInteractions () {
      return this.$interactionsCollection.getArray()
    },
    /**
     * @return {module:ol/Collection~Collection<module:ol/interaction/Interaction~Interaction>}
     */
    getInteractionsCollection () {
      return this._interactionsCollection
    },
    /**
     * @param {string|number} interactionId
     * @return {module:ol/interaction/Interaction~Interaction|undefined}
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
     * @return {function(): number}
     * @protected
     */
    getDefaultInteractionsSorter () {
      // sort interactions by priority in asc order
      // the higher the priority, the earlier the interaction handles the event
      return (a, b) => {
        const ap = getInteractionPriority(a) || 0
        const bp = getInteractionPriority(b) || 0
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
     * @returns {{readonly interactionsContainer: Object}}
     * @protected
     */
    getServices () {
      const vm = this

      return {
        get interactionsContainer () { return vm },
      }
    },
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
  const adds = obsFromOlEvent(this.$interactionsCollection, 'add')
  const removes = obsFromOlEvent(this.$interactionsCollection, 'remove')

  this.subscribeTo(mergeObs(adds, removes), ({ type, element }) => {
    ++this.rev

    this.$nextTick(() => {
      this.$emit(type + 'interaction', element)
    })
  })
}
