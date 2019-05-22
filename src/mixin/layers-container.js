import Collection from 'ol/Collection'
import BaseLayer from 'ol/layer/Base'
import Vue from 'vue'
import { merge as mergeObs } from 'rxjs/observable'
import { getLayerId, initializeLayer } from '../ol-ext'
import { observableFromOlEvent } from '../rx-ext'
import { instanceOf } from '../util/assert'
import rxSubs from './rx-subs'

export default {
  mixins: [rxSubs],
  computed: {
    layerIds () {
      if (!this.rev) return []

      return this.getLayers().map(getLayerId)
    },
  },
  methods: {
    /**
     * @param {BaseLayer|Vue} layer
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
     * @param {BaseLayer|Vue} layer
     * @return {void}
     */
    removeLayer (layer) {
      layer = this.getLayerById(getLayerId(layer))
      if (!layer) return

      this._layersCollection.remove(layer)
    },
    /**
     * @return {BaseLayer[]}
     */
    getLayers () {
      return this._layersCollection.getArray()
    },
    /**
     * @return {module:ol/Collection~Collection<BaseLayer>}
     */
    getLayersCollection () {
      return this._layersCollection
    },
    /**
     * @param {string|number} layerId
     * @return {BaseLayer|undefined}
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
     * @type {Collection<BaseLayer>}
     * @private
     */
    this._layersCollection = new Collection()

    const add = observableFromOlEvent(this._layersCollection, 'add')
    const remove = observableFromOlEvent(this._layersCollection, 'remove')
    const events = mergeObs(add, remove)

    this.subscribeTo(events, () => {
      ++this.rev
    })
  },
}
