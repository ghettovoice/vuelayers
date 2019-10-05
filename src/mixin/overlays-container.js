import { Collection, Overlay } from 'ol'
import { merge as mergeObs } from 'rxjs/observable'
import Vue from 'vue'
import { getOverlayId, initializeOverlay } from '../ol-ext'
import { observableFromOlEvent } from '../rx-ext'
import { instanceOf } from '../util/assert'
import rxSubs from './rx-subs'

export default {
  mixins: [rxSubs],
  computed: {
    overlayIds () {
      if (!this.rev) return []

      return this.getOverlays().map(getOverlayId)
    },
  },
  methods: {
    /**
     * @param {Overlay|Vue} overlay
     * @return {void}
     */
    async addOverlay (overlay) {
      if (overlay instanceof Vue) {
        overlay = await overlay.resolveOlObject()
      }

      instanceOf(overlay, Overlay)

      if (this.getOverlayById(getOverlayId(overlay)) == null) {
        initializeOverlay(overlay)
        this.$overlaysCollection.push(overlay)
      }
    },
    /**
     * @param {Overlay|Vue} overlay
     * @return {void}
     */
    async removeOverlay (overlay) {
      if (overlay instanceof Vue) {
        overlay = await overlay.resolveOlObject()
      }

      overlay = this.getOverlayById(getOverlayId(overlay))
      if (!overlay) return

      this.$overlaysCollection.remove(overlay)
    },
    /**
     * @return {Overlay[]}
     */
    getOverlays () {
      return this.$overlaysCollection.getArray()
    },
    /**
     * @return {Collection<Overlay>}
     */
    getOverlaysCollection () {
      return this._overlaysCollection
    },
    /**
     * @param {string|number} overlayId
     * @return {Overlay|undefined}
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
     * @returns {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return {
        get overlaysContainer () { return vm },
      }
    },
  },
  created () {
    /**
     * @type {Collection<Overlay>}
     * @private
     */
    this._overlaysCollection = new Collection()

    this::defineServices()
    this::subscribeToCollectionEvents()
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
  const adds = observableFromOlEvent(this.$overlaysCollection, 'add')
  const removes = observableFromOlEvent(this.$overlaysCollection, 'remove')

  this.subscribeTo(mergeObs(adds, removes), ({ type, element }) => {
    ++this.rev

    this.$nextTick(() => {
      this.$emit(type + ':overlay', element)
    })
  })
}
