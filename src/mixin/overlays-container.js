import Collection from 'ol/Collection'
import Overlay from 'ol/Overlay'
import Vue from 'vue'
import { getOverlayId, initializeOverlay } from '../ol-ext'
import { instanceOf } from '../util/assert'

export default {
  computed: {
    overlayIds () {
      if (!this.rev) return []

      return this.getOverlays().map(getOverlayId)
    },
  },
  methods: {
    /**
     * @param {module:ol/Overlay~Overlay|Vue} overlay
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
     * @param {module:ol/Overlay~Overlay|Vue} overlay
     * @return {void}
     */
    removeOverlay (overlay) {
      overlay = this.getOverlayById(getOverlayId(overlay))
      if (!overlay) return

      this._overlaysCollection.remove(overlay)
    },
    /**
     * @return {module:ol/Overlay~Overlay[]}
     */
    getOverlays () {
      return this._overlaysCollection.getArray()
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
     * @type {module:ol/Collection~Collection<module:ol/Overlay~Overlay>}
     * @private
     */
    this._overlaysCollection = new Collection()
  },
}
