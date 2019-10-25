import Collection from 'ol/Collection'
import Overlay from 'ol/Overlay'
import Vue from 'vue'
import { merge as mergeObs } from 'rxjs/observable'
import { getOverlayId, initializeOverlay } from '../ol-ext'
import { observableFromOlEvent } from '../rx-ext'
import { instanceOf } from '../util/assert'
import rxSubs from './rx-subs'
import identMap from './ident-map'

export default {
  mixins: [identMap, rxSubs],
  computed: {
    overlayIds () {
      if (!this.rev) return []

      return this.getOverlays().map(getOverlayId)
    },
    overlaysCollectionIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'overlays_collection')
    },
  },
  methods: {
    /**
     * @param {Overlay|Vue} overlay
     * @return {void}
     */
    addOverlay (overlay) {
      overlay = overlay instanceof Vue ? overlay.$overlay : overlay
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
    removeOverlay (overlay) {
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
      return this.$overlaysCollection.getArray().find(overlay => {
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
    this._overlaysCollection = this.instanceFactoryCall(this.overlaysCollectionIdent, () => new Collection())

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
