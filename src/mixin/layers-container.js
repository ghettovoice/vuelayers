import { Collection } from 'ol'
import BaseLayer from 'ol/layer/Base'
import { merge as mergeObs } from 'rxjs/observable'
import Vue from 'vue'
import { getLayerId, initializeLayer } from '../ol-ext'
import { obsFromOlEvent } from '../rx-ext'
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
  created () {
    /**
     * @type {Collection<BaseLayer>}
     * @private
     */
    this._layersCollection = new Collection()

    this::defineServices()
    this::subscribeToCollectionEvents()
  },
  methods: {
    /**
     * @param {BaseLayer|Vue} layer
     * @return {Promise<void>}
     */
    async addLayer (layer) {
      if (layer instanceof Vue) {
        layer = await layer.resolveOlObject()
      }

      instanceOf(layer, BaseLayer)

      if (this.getLayerById(getLayerId(layer)) == null) {
        initializeLayer(layer)
        this.$layersCollection.push(layer)
      }
    },
    /**
     * @param {BaseLayer|Vue} layer
     * @return {void}
     */
    async removeLayer (layer) {
      if (layer instanceof Vue) {
        layer = await layer.resolveOlObject()
      }

      layer = this.getLayerById(getLayerId(layer))
      if (!layer) return

      this.$layersCollection.remove(layer)
    },
    /**
     * @return {BaseLayer[]}
     */
    getLayers () {
      return this.$layersCollection.getArray()
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
      return this.getLayers().find(layer => {
        return getLayerId(layer) === layerId
      })
    },
    /**
     * @return {void}
     */
    clearLayers () {
      this.$layersCollection.clear()
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
}

function defineServices () {
  Object.defineProperties(this, {
    $layersCollection: {
      enumerable: true,
      get: this.getLayersCollection,
    },
  })
}

function subscribeToCollectionEvents () {
  const adds = obsFromOlEvent(this.$layersCollection, 'add')
  const removes = obsFromOlEvent(this.$layersCollection, 'remove')

  this.subscribeTo(mergeObs(adds, removes), ({ type, element }) => {
    ++this.rev

    this.$nextTick(() => {
      this.$emit(type + ':layer', element)
    })
  })
}
