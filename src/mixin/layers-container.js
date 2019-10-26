import { Collection } from 'ol'
import BaseLayer from 'ol/layer/Base'
import { merge as mergeObs } from 'rxjs/observable'
import { getLayerId, initializeLayer } from '../ol-ext'
import { obsFromOlEvent } from '../rx-ext'
import { instanceOf } from '../util/assert'
import { isFunction, map } from '../util/minilo'
import identMap from './ident-map'
import rxSubs from './rx-subs'

/**
 * @typedef {module:ol/layer/Base~BaseLayer|Object} LayerLike
 */

/**
 * Layers container mixin.
 */
export default {
  mixins: [
    identMap,
    rxSubs,
  ],
  computed: {
    layerIds () {
      if (!this.rev) return []

      return this.getLayers().map(getLayerId)
    },
    layersCollectionIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'layers_collection')
    },
  },
  created () {
    /**
     * @type {module:ol/Collection~Collection<module:ol/layer/Base~BaseLayer>}
     * @private
     */
    this._layersCollection = this.instanceFactoryCall(this.layersCollectionIdent, () => new Collection())

    this::defineServices()
    this::subscribeToCollectionEvents()
  },
  methods: {
    /**
     * @param {LayerLike} layer
     * @return {Promise<void>}
     */
    async addLayer (layer) {
      initializeLayer(layer)

      if (isFunction(layer.resolveOlObject)) {
        layer = await layer.resolveOlObject()
      }

      instanceOf(layer, BaseLayer)

      if (this.getLayerById(getLayerId(layer)) == null) {
        this.$layersCollection.push(layer)
      }
    },
    /**
     * @param {LayerLike[]|module:ol/Collection~Collection<LayerLike>} layers
     * @returns {Promise<void>}
     */
    async addLayers (layers) {
      await Promise.all(map(layers, ::this.addLayer))
    },
    /**
     * @param {LayerLike} layer
     * @return {void}
     */
    async removeLayer (layer) {
      if (isFunction(layer.resolveOlObject)) {
        layer = await layer.resolveOlObject()
      }

      layer = this.getLayerById(getLayerId(layer))
      if (!layer) return

      this.$layersCollection.remove(layer)
    },
    /**
     * @param {LayerLike[]|module:ol/Collection~Collection<LayerLike>} layers
     * @returns {Promise<void>}
     */
    async removeLayers (layers) {
      await Promise.all(map(layers, ::this.removeLayer))
    },
    /**
     * @return {Array<module:ol/layer/Base~BaseLayer>}
     */
    getLayers () {
      return this.$layersCollection.getArray()
    },
    /**
     * @return {module:ol/Collection~Collection<module:ol/layer/Base~BaseLayer>}
     */
    getLayersCollection () {
      return this._layersCollection
    },
    /**
     * @param {string|number} layerId
     * @return {module:ol/layer/Base~BaseLayer|undefined}
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
     * @returns {{readonly layersContainer: Object}}
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
      this.$emit(type + 'layer', element)
    })
  })
}
