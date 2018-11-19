import Overlay from 'ol/Overlay'
import Vue from 'vue'
import { instanceOf } from '../util/assert'

const methods = {
  /**
   * @return {IndexedCollectionAdapter}
   * @protected
   */
  getOverlaysTarget () {
    throw new Error('Not implemented method')
  },
  /**
   * @param {Overlay|Vue} overlay
   * @return {void}
   */
  addOverlay (overlay) {
    overlay = overlay instanceof Vue ? overlay.$overlay : overlay
    instanceOf(overlay, Overlay)

    if (this.getOverlaysTarget().has(overlay) === false) {
      this.getOverlaysTarget().add(overlay)
    }
  },
  /**
   * @param {Overlay|Vue} overlay
   * @return {void}
   */
  removeOverlay (overlay) {
    overlay = overlay instanceof Vue ? overlay.$overlay : overlay

    if (!overlay) return

    if (this.getOverlaysTarget().has(overlay)) {
      this.getOverlaysTarget().remove(overlay)
    }
  },
  /**
   * @return {Overlay[]}
   */
  getOverlays () {
    return this.getOverlaysTarget().elements
  },
  /**
   * @param {string|number} id
   * @return {Overlay|undefined}
   */
  getOverlayById (id) {
    return this.getOverlaysTarget().findByKey(id)
  },
  /**
   * @return {void}
   */
  clearOverlays () {
    this.getOverlaysTarget().clear()
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
}

export default {
  methods,
}
