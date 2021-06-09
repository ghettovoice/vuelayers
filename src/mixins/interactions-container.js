import { Collection } from 'ol'
import CollectionEventType from 'ol/CollectionEventType'
import { defaults as createDefaultInteractions, Interaction } from 'ol/interaction'
import { getUid } from 'ol/util'
import { merge as mergeObs } from 'rxjs'
import { map as mapObs, tap } from 'rxjs/operators'
import { getInteractionId, getInteractionPriority, initializeInteraction } from '../ol-ext'
import { bufferDebounceTime, fromOlChangeEvent as obsFromOlChangeEvent, fromOlEvent as obsFromOlEvent } from '../rx-ext'
import { find, forEach, instanceOf, isArray, isPlainObject } from '../utils'
import identMap from './ident-map'
import { FRAME_TIME, makeChangeOrRecreateWatchers } from './ol-cmp'
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
     * @returns {string|undefined}
     */
    interactionsCollectionIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'interactions_collection')
    },
  },
  watch: {
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'interactionsCollectionIdent',
    ]),
  },
  created () {
    /**
     * @type {module:ol/Collection~Collection<module:ol/interaction/Interaction~Interaction>}
     * @private
     */
    this._interactionsCollection = this.instanceFactoryCall(this.interactionsCollectionIdent, () => new Collection())
    this._interactionSubs = {}

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
     */
    initDefaultInteractions (defaultInteractions) {
      this.getInteractions().forEach(interaction => {
        if (interaction.get('vl_default')) {
          this.removeInteraction(interaction)
        }
      })

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
        interactions.forEach(interaction => interaction.set('vl_default', true))
        this.addInteractions(interactions)
      }
    },
    /**
     * @param {InteractionLike} interaction
     * @return {Interaction}
     */
    initializeInteraction (interaction) {
      interaction = interaction?.$interaction || interaction
      instanceOf(interaction, Interaction)

      return initializeInteraction(interaction)
    },
    /**
     * @param {InteractionLike[]|module:ol/Collection~Collection<InteractionLike>} interactions
     */
    addInteractions (interactions) {
      forEach(interactions, ::this.addInteraction)
    },
    /**
     * @param {InteractionLike} interaction
     */
    addInteraction (interaction) {
      interaction = this.initializeInteraction(interaction)

      if (this.getInteractionById(getInteractionId(interaction))) return

      this.$interactionsCollection.push(interaction)
      this.sortInteractions()
    },
    /**
     * @param {InteractionLike[]|module:ol/Collection~Collection<InteractionLike>} interactions
     */
    removeInteractions (interactions) {
      forEach(interactions, ::this.removeInteraction)
    },
    /**
     * @param {InteractionLike} interaction
     */
    removeInteraction (interaction) {
      interaction = this.getInteractionById(getInteractionId(interaction?.$interaction || interaction))
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
      return this.$interactionsCollection.getArray().slice()
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
     * @param {function} [sorter]
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
     * @param {string|undefined} value
     * @param {string|undefined} prevValue
     * @protected
     */
    interactionsCollectionIdentChanged (value, prevValue) {
      if (value && prevValue) {
        this.moveInstance(value, prevValue)
      } else if (value && !prevValue && this.$interactionsCollection) {
        this.setInstance(value, this.$interactionsCollection)
      } else if (!value && prevValue) {
        this.unsetInstance(prevValue)
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
    mapObs(evt => ({
      ...evt,
      element: this.initializeInteraction(evt.element),
    })),
    tap(({ element }) => {
      const uid = getUid(element)
      const propChanges = obsFromOlChangeEvent(element, 'id', true)
      this._interactionSubs[uid] = this.subscribeTo(propChanges, ::this.scheduleRefresh)
    }),
  )
  const removes = obsFromOlEvent(this.$interactionsCollection, CollectionEventType.REMOVE).pipe(
    tap(({ element }) => {
      const uid = getUid(element)
      if (this._interactionSubs[uid]) {
        this.unsubscribe(this._interactionSubs[uid])
        delete this._interactionSubs[uid]
      }
    }),
  )
  const events = mergeObs(adds, removes).pipe(
    bufferDebounceTime(FRAME_TIME),
  )
  this.subscribeTo(events, async events => {
    await this.debounceChanged()
    forEach(events, ({ type, element }) => {
      this.$emit(type + 'interaction', element)
      // todo remove in v0.13.x
      this.$emit(type + ':interaction', element)
    })
  })
}
