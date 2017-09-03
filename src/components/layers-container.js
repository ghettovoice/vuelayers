import Vue from 'vue'

const methods = {
  /**
   * @return {{
   *     hasLayer: function(ol.Layer): bool,
   *     addLayer: function(ol.Layer): void,
   *     removeLayer: function(ol.Layer): void
   *   }|undefined}
   * @protected
   */
  getLayersTarget () {
    throw new Error('Not implemented method')
  },
  /**
   * @param {ol.layer.Layer|Vue} layer
   * @return {void}
   */
  addLayer (layer) {
    layer = layer instanceof Vue ? layer.$layer : layer

    if (!layer) return

    if (!this._layers[layer.get('id')]) {
      this._layers[layer.get('id')] = layer
    }

    const layersTarget = this.getLayersTarget()
    if (layersTarget && !layersTarget.hasLayer(layer)) {
      layersTarget.addLayer(layer)
    }
  },
  /**
   * @param {ol.layer.Layer|Vue} layer
   * @return {void}
   */
  removeLayer (layer) {
    layer = layer instanceof Vue ? layer.$layer : layer

    if (!layer) return

    delete this._layers[layer.get('id')]

    const layersTarget = this.getLayersTarget()
    if (layersTarget && layersTarget.hasLayer(layer)) {
      layersTarget.removeLayer(layer)
    }
  },
  /**
   * @return {ol.layer.Layer[]}
   */
  getLayers () {
    return Object.values(this._layers)
  },
  /**
   * @param {string|number} id
   * @return {ol.layer.Layer|undefined}
   */
  getLayerById (id) {
    return this._layers[id]
  },
  /**
   * @returns {Object}
   * @protected
   */
  getServices () {
    const vm = this

    return {
      get layersContainer () { return vm }
    }
  }
}

export default {
  methods,
  created () {
    /**
     * @type {Object<string, ol.layer.Layer>}
     * @private
     */
    this._layers = Object.create(null)
  },
  destroyed () {
    this._layers = Object.create(null)
  }
}
