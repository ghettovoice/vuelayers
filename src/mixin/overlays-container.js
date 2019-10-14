import { Collection, Overlay } from 'ol'
import { merge as mergeObs } from 'rxjs/observable'
import { getOverlayId, initializeOverlay } from '../ol-ext'
import { obsFromOlEvent } from '../rx-ext'
import { instanceOf } from '../util/assert'
import { isFunction, map } from '../util/minilo'
import rxSubs from './rx-subs'

/**
 * @typedef {module:ol/Overlay~Overlay|Object} OverlayLike
 */

/**
 * Overlays container mixin.
 */
export default {
  mixins: [rxSubs],
  computed: {
    overlayIds () {
      if (!this.rev) return []

      return this.getOverlays().map(getOverlayId)
    },
  },
  created () {
    /**
     * @type {module:ol/Collection~Collection<module:ol/Overlay~Overlay>}
     * @private
     */
    this._overlaysCollection = new Collection()

    this::defineServices()
    this::subscribeToCollectionEvents()
  },
  methods: {
    /**
     * @param {OverlayLike} overlay
     * @return {void}
     */
    async addOverlay (overlay) {
      initializeOverlay(overlay)

      if (isFunction(overlay.resolveOlObject)) {
        overlay = await overlay.resolveOlObject()
      }

      instanceOf(overlay, Overlay)

      if (this.getOverlayById(getOverlayId(overlay)) == null) {
        this.$overlaysCollection.push(overlay)
      }
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
    async removeOverlay (overlay) {
      if (isFunction(overlay.resolveOlObject)) {
        overlay = await overlay.resolveOlObject()
      }

      overlay = this.getOverlayById(getOverlayId(overlay))
      if (!overlay) return

      this.$overlaysCollection.remove(overlay)
    },
    /**
     * @param {OverlayLike[]|module:ol/Collection~Collection<OverlayLike>} overlays
     * @returns {Promise<void>}
     */
    async removeOverlays (overlays) {
      await Promise.all(map(overlays, ::this.removeOverlay))
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
      return this.getOverlays().find(overlay => {
        return getOverlayId(overlay) === overlayId
      })
    },
    /**
     * @return {void}
     */
    clearOverlays () {
      this.$overlaysCollection.clear()
    },
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
  const adds = obsFromOlEvent(this.$overlaysCollection, 'add')
  const removes = obsFromOlEvent(this.$overlaysCollection, 'remove')

  this.subscribeTo(mergeObs(adds, removes), ({ type, element }) => {
    ++this.rev

    this.$nextTick(() => {
      this.$emit(type + 'overlay', element)
    })
  })
}
