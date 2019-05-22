import Collection from 'ol/Collection'
import Overlay from 'ol/Overlay'
import Vue from 'vue'
import { merge as mergeObs } from 'rxjs/observable'
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
    addOverlay (overlay) {
      overlay = overlay instanceof Vue ? overlay.$overlay : overlay
      instanceOf(overlay, Overlay)

      if (this.getOverlayById(getOverlayId(overlay)) == null) {
        initializeOverlay(overlay)
        this._overlaysCollection.push(overlay)
      }
    },
    /**
     * @param {Overlay|Vue} overlay
     * @return {void}
     */
    removeOverlay (overlay) {
      overlay = this.getOverlayById(getOverlayId(overlay))
      if (!overlay) return

      this._overlaysCollection.remove(overlay)
    },
    /**
     * @return {Overlay[]}
     */
    getOverlays () {
      return this._overlaysCollection.getArray()
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
      return this._overlaysCollection.getArray().find(overlay => {
        return getOverlayId(overlay) === overlayId
      })
    },
    /**
     * @return {void}
     */
    clearOverlays () {
      this._overlaysCollection.clear()
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

    const add = observableFromOlEvent(this._overlaysCollection, 'add')
    const remove = observableFromOlEvent(this._overlaysCollection, 'remove')
    const events = mergeObs(add, remove)

    this.subscribeTo(events, ({ type, element }) => {
      ++this.rev

      this.$emit(type + ':overlay', getOverlayId(element))
    })
  },
}
