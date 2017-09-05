import Vue from 'vue'

const methods = {
  /**
   * @return {{
   *     hasOverlay: function(ol.Overlay): bool,
   *     addOverlay: function(ol.Overlay): void,
   *     removeOverlay: function(ol.Overlay): void
   *   }|undefined}
   * @protected
   */
  getOverlaysTarget () {
    throw new Error('Not implemented method')
  },
  /**
   * @param {ol.Overlay|Vue} overlay
   * @return {void}
   */
  addOverlay (overlay) {
    overlay = overlay instanceof Vue ? overlay.$overlay : overlay

    if (!overlay) return

    if (!this._overlays[overlay.getId()]) {
      this._overlays[overlay.getId()] = overlay
    }

    const overlaysTarget = this.getOverlaysTarget()
    if (overlaysTarget && !overlaysTarget.hasOverlay(overlay)) {
      overlaysTarget.addOverlay(overlay)
    }
  },
  /**
   * @param {ol.Overlay|Vue} overlay
   * @return {void}
   */
  removeOverlay (overlay) {
    overlay = overlay instanceof Vue ? overlay.$overlay : overlay

    if (!overlay) return

    delete this._overlays[overlay.getId()]

    const overlaysTarget = this.getOverlaysTarget()
    if (overlaysTarget && overlaysTarget.hasOverlay(overlay)) {
      overlaysTarget.removeOverlay(overlay)
    }
  },
  /**
   * @return {ol.Overlay[]}
   */
  getOverlays () {
    return Object.values(this._overlays)
  },
  /**
   * @param {string|number} id
   * @return {ol.Overlay|undefined}
   */
  getOverlayById (id) {
    return this._overlays[id]
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
  created () {
    /**
     * @type {Object<string, ol.Overlay>}
     * @private
     */
    this._overlays = Object.create(null)
  },
  destroyed () {
    this._overlays = Object.create(null)
  },
}
