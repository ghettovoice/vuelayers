import Collection from 'ol/Collection'
import BaseLayer from 'ol/layer/Base'
import Vue from 'vue'
import { getLayerId, initializeLayer } from '../ol-ext'
import { instanceOf } from '../util/assert'

export default {
  computed: {
    layerIds () {
      if (!this.rev) return []

      return this.getLayers().map(getLayerId)
    },
  },
  methods: {
    /**
     * @param {module:ol/layer/BaseLayer~BaseLayer|Vue} layer
     * @return {void}
     */
    addLayer (layer) {
      layer = layer instanceof Vue ? layer.$layer : layer
      instanceOf(layer, BaseLayer)

      if (this.getLayerById(getLayerId(layer)) == null) {
        initializeLayer(layer)
        this._layersCollection.push(layer)
      }
    },
    /**
     * @param {module:ol/layer/BaseLayer~BaseLayer|Vue} layer
     * @return {void}
     */
    removeLayer (layer) {
      layer = this.getLayerById(getLayerId(layer))
      if (!layer) return

      this._layersCollection.remove(layer)
    },
    /**
     * @return {module:ol/layer/BaseLayer~BaseLayer[]}
     */
    getLayers () {
      return this._layersCollection.getArray()
    },
    /**
     * @return {module:ol/Collection~Collection<module:ol/layer/BaseLayer~BaseLayer>}
     */
    getLayersCollection () {
      return this._layersCollection
    },
    /**
     * @param {string|number} layerId
     * @return {module:ol/layer/BaseLayer~BaseLayer|undefined}
     */
    getLayerById (layerId) {
      return this._layersCollection.getArray().find(layer => {
        return getLayerId(layer) === layerId
      })
    },
    /**
     * @return {void}
     */
    clearLayers () {
      this._layersCollection.clear()
    },
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return {
        get layersContainer () { return vm },
      }
    },
  },
  created () {
    /**
     * @type {module:ol/Collection~Collection<module:ol/layer/BaseLayer>}
     * @private
     */
    this._layersCollection = new Collection()
  },
}
