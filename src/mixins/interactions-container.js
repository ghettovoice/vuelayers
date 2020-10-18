import debounce from 'debounce-promise'
import { Collection } from 'ol'
import CollectionEventType from 'ol/CollectionEventType'
import { defaults as createDefaultInteractions, Interaction } from 'ol/interaction'
import { from as fromObs, merge as mergeObs } from 'rxjs'
import { map as mapObs, mergeMap } from 'rxjs/operators'
import { getInteractionId, getInteractionPriority, initializeInteraction } from '../ol-ext'
import { bufferDebounceTime, fromOlEvent as obsFromOlEvent } from '../rx-ext'
import { instanceOf, isArray, isFunction, isPlainObject, map, find, forEach, isEqual } from '../utils'
import identMap from './ident-map'
import { FRAME_TIME } from './ol-cmp'
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
    currentInteractions () {
      if (!this.rev) return []

      return map(this.getInteractions(), getInteractionId)
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
    currentInteractions: /*#__PURE__*/debounce(function (value, prev) {
      if (isEqual(value, prev)) return

      this.$emit('update:interactions', value.slice())
    }, FRAME_TIME),
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
  },
  methods: {
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
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToCollectionEvents()
    },
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
     * @return {Promise<Interaction>}
     */
    async initializeInteraction (interaction) {
      if (isFunction(interaction.resolveOlObject)) {
        interaction = await interaction.resolveOlObject()
      }

      return initializeInteraction(interaction)
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
    async addInteraction (interaction) {
      interaction = await this.initializeInteraction(interaction)
      instanceOf(interaction, Interaction)

      if (this.getInteractionById(getInteractionId(interaction))) return

      this.$interactionsCollection.push(interaction)
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
     * @return {void}
     */
    clearInteractions () {
      this.$interactionsCollection.clear()
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
      return find(this.getInteractions(), interaction => getInteractionId(interaction) === interactionId)
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
  const adds = obsFromOlEvent(this.$interactionsCollection, CollectionEventType.ADD).pipe(
    mergeMap(({ type, element }) => fromObs(this.initializeInteraction(element)).pipe(
      mapObs(element => ({ type, element })),
    )),
  )
  const removes = obsFromOlEvent(this.$interactionsCollection, CollectionEventType.REMOVE)
  const events = mergeObs(adds, removes).pipe(
    bufferDebounceTime(FRAME_TIME),
  )
  this.subscribeTo(events, events => {
    ++this.rev

    this.$nextTick(() => {
      forEach(events, ({ type, element }) => {
        this.$emit(type + 'interaction', element)
        // todo remove in v0.13.x
        this.$emit(type + ':interaction', element)
      })
    })
  })
}
