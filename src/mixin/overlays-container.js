import debounce from 'debounce-promise'
import { Collection, Overlay } from 'ol'
import CollectionEventType from 'ol/CollectionEventType'
import { from as fromObs, merge as mergeObs } from 'rxjs'
import { map as mapObs, mergeMap } from 'rxjs/operators'
import { getOverlayId, initializeOverlay } from '../ol-ext'
import { bufferDebounceTime, fromOlEvent as obsFromOlEvent } from '../rx-ext'
import { instanceOf } from '../util/assert'
import { isFunction, map, forEach, find, isEqual } from '../util/minilo'
import identMap from './ident-map'
import { FRAME_TIME } from './ol-cmp'
import rxSubs from './rx-subs'

/**
 * @typedef {module:ol/Overlay~Overlay|Object} OverlayLike
 */

/**
 * Overlays container mixin.
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
    currentOverlays () {
      if (!this.rev) return []

      return map(this.getOverlays(), getOverlayId)
    },
    /**
     * @returns {string|undefined}
     */
    overlaysCollectionIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'overlays_collection')
    },
  },
  watch: {
    currentOverlays: debounce(function (value, prev) {
      if (isEqual(value, prev)) return

      this.$emit('update:overlays', value.slice())
    }, FRAME_TIME),
    overlaysCollectionIdent (value, prevValue) {
      if (value && prevValue) {
        this.moveInstance(value, prevValue)
      } else if (value && !prevValue && this.$overlaysCollection) {
        this.setInstance(value, this.$overlaysCollection)
      } else if (!value && prevValue) {
        this.unsetInstance(prevValue)
      }
    },
  },
  created () {
    /**
     * @type {module:ol/Collection~Collection<module:ol/Overlay~Overlay>}
     * @private
     */
    this._overlaysCollection = this.instanceFactoryCall(this.overlaysCollectionIdent, () => new Collection())

    this::defineServices()
    this::subscribeToCollectionEvents()
  },
  methods: {
    /**
     * @returns {readonly overlaysContainer: Object}}
     * @protected
     */
    getServices () {
      const vm = this

      return {
        get overlaysContainer () { return vm },
      }
    },
    /**
     * @param {OverlayLike} overlay
     * @return {Promise<Overlay>}
     */
    async initializeOverlay (overlay) {
      if (isFunction(overlay.resolveOlObject)) {
        overlay = await overlay.resolveOlObject()
      }

      return initializeOverlay(overlay)
    },
    /**
     * @param {OverlayLike[]|module:ol/Collection~Collection<OverlayLike>} overlays
     * @returns {Promise<void>}
     */
    async addOverlays (overlays) {
      await Promise.all(map(overlays, ::this.addOverlay))
    },
    /**
     * @param {OverlayLike} overlay
     * @return {void}
     */
    async addOverlay (overlay) {
      overlay = await this.initializeOverlay(overlay)
      instanceOf(overlay, Overlay)

      if (this.getOverlayById(getOverlayId(overlay))) return

      this.$overlaysCollection.push(overlay)
    },
    /**
     * @param {OverlayLike[]|module:ol/Collection~Collection<OverlayLike>} overlays
     * @returns {Promise<void>}
     */
    async removeOverlays (overlays) {
      await Promise.all(map(overlays, ::this.removeOverlay))
    },
    /**
     * @param {OverlayLike} overlay
     * @return {void}
     */
    async removeOverlay (overlay) {
      if (isFunction(overlay.resolveOlObject)) {
        overlay = await overlay.resolveOlObject()
      }

      overlay = this.getOverlayById(getOverlayId(overlay))
      if (!overlay) return

      this.$overlaysCollection.remove(overlay)
    },
    /**
     * @return {void}
     */
    clearOverlays () {
      this.$overlaysCollection.clear()
    },
    /**
     * @return {Array<module:ol/Overlay~Overlay>}
     */
    getOverlays () {
      return this.$overlaysCollection.getArray()
    },
    /**
     * @return {module:ol/Collection~Collection<module:ol/Overlay~Overlay>}
     */
    getOverlaysCollection () {
      return this._overlaysCollection
    },
    /**
     * @param {string|number} overlayId
     * @return {module:ol/Overlay~Overlay|undefined}
     */
    getOverlayById (overlayId) {
      return find(this.getOverlays(), overlay => getOverlayId(overlay) === overlayId)
    },
  },
}

function defineServices () {
  Object.defineProperties(this, {
    $overlaysCollection: {
      enumerable: true,
      get: this.getOverlaysCollection,
    },
  })
}

function subscribeToCollectionEvents () {
  const adds = obsFromOlEvent(this.$overlaysCollection, CollectionEventType.ADD).pipe(
    mergeMap(({ type, element }) => fromObs(this.initializeOverlay(element)).pipe(
      mapObs(element => ({ type, element })),
    )),
  )
  const removes = obsFromOlEvent(this.$overlaysCollection, CollectionEventType.REMOVE)
  const events = mergeObs(adds, removes).pipe(
    bufferDebounceTime(FRAME_TIME),
  )
  this.subscribeTo(events, events => {
    ++this.rev

    this.$nextTick(() => {
      forEach(events, ({ type, element }) => {
        this.$emit(type + 'overlay', element)
        // todo remove in v0.13.x
        this.$emit(type + ':overlay', element)
      })
    })
  })
}
