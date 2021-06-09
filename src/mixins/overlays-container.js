import { Collection, Overlay } from 'ol'
import CollectionEventType from 'ol/CollectionEventType'
import { getUid } from 'ol/util'
import { merge as mergeObs } from 'rxjs'
import { map as mapObs, tap } from 'rxjs/operators'
import { getOverlayId, initializeOverlay } from '../ol-ext'
import { bufferDebounceTime, fromOlChangeEvent as obsFromOlChangeEvent, fromOlEvent as obsFromOlEvent } from '../rx-ext'
import { find, forEach, instanceOf } from '../utils'
import identMap from './ident-map'
import { FRAME_TIME, makeChangeOrRecreateWatchers } from './ol-cmp'
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
     * @returns {string|undefined}
     */
    overlaysCollectionIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'overlays_collection')
    },
  },
  watch: {
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'overlaysCollectionIdent',
    ]),
  },
  created () {
    /**
     * @type {module:ol/Collection~Collection<module:ol/Overlay~Overlay>}
     * @private
     */
    this._overlaysCollection = this.instanceFactoryCall(this.overlaysCollectionIdent, () => new Collection())
    this._overlaySubs = {}

    this::defineServices()
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
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToCollectionEvents()
    },
    /**
     * @param {OverlayLike} overlay
     * @return {Overlay}
     */
    initializeOverlay (overlay) {
      overlay = overlay?.$overlay || overlay
      instanceOf(overlay, Overlay)

      return initializeOverlay(overlay)
    },
    /**
     * @param {OverlayLike[]|module:ol/Collection~Collection<OverlayLike>} overlays
     */
    addOverlays (overlays) {
      forEach(overlays, ::this.addOverlay)
    },
    /**
     * @param {OverlayLike} overlay
     */
    addOverlay (overlay) {
      overlay = this.initializeOverlay(overlay)

      if (this.getOverlayById(getOverlayId(overlay))) return

      this.$overlaysCollection.push(overlay)
    },
    /**
     * @param {OverlayLike[]|module:ol/Collection~Collection<OverlayLike>} overlays
     */
    removeOverlays (overlays) {
      forEach(overlays, ::this.removeOverlay)
    },
    /**
     * @param {OverlayLike} overlay
     */
    removeOverlay (overlay) {
      overlay = this.getOverlayById(getOverlayId(overlay?.$overlay || overlay))
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
      return this.$overlaysCollection.getArray().slice()
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
    /**
     * @param {string|undefined} value
     * @param {string|undefined} prevValue
     * @protected
     */
    overlaysCollectionIdentChanged (value, prevValue) {
      if (value && prevValue) {
        this.moveInstance(value, prevValue)
      } else if (value && !prevValue && this.$overlaysCollection) {
        this.setInstance(value, this.$overlaysCollection)
      } else if (!value && prevValue) {
        this.unsetInstance(prevValue)
      }
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
    mapObs(evt => ({
      ...evt,
      element: this.initializeOverlay(evt.element),
    })),
    tap(({ element }) => {
      const uid = getUid(element)
      const propChanges = obsFromOlChangeEvent(element, 'id', true)
      this._overlaySubs[uid] = this.subscribeTo(propChanges, ::this.scheduleRefresh)
    }),
  )
  const removes = obsFromOlEvent(this.$overlaysCollection, CollectionEventType.REMOVE).pipe(
    tap(({ element }) => {
      const uid = getUid(element)
      if (this._overlaySubs[uid]) {
        this.unsubscribe(this._overlaySubs[uid])
        delete this._overlaySubs[uid]
      }
    }),
  )
  const events = mergeObs(adds, removes).pipe(
    bufferDebounceTime(FRAME_TIME),
  )
  this.subscribeTo(events, async events => {
    await this.debounceChanged()
    forEach(events, ({ type, element }) => {
      this.$emit(type + 'overlay', element)
      // todo remove in v0.13.x
      this.$emit(type + ':overlay', element)
    })
  })
}
