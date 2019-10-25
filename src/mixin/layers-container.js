import Collection from 'ol/Collection'
import BaseLayer from 'ol/layer/Base'
import Vue from 'vue'
import { merge as mergeObs } from 'rxjs/observable'
import { getLayerId, initializeLayer } from '../ol-ext'
import { observableFromOlEvent } from '../rx-ext'
import { instanceOf } from '../util/assert'
import rxSubs from './rx-subs'
import identMap from './ident-map'

export default {
  mixins: [identMap, rxSubs],
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
        this.$layersCollection.push(layer)
      }
    },
    /**
     * @param {BaseLayer|Vue} layer
     * @return {void}
     */
    removeLayer (layer) {
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
      return this.$layersCollection.getArray().find(layer => {
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
  created () {
    this._layersCollection = this.instanceFactoryCall(this.layersCollectionIdent, () => new Collection())

    this::defineServices()
    this::subscribeToCollectionEvents()
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
  const adds = observableFromOlEvent(this.$layersCollection, 'add')
  const removes = observableFromOlEvent(this.$layersCollection, 'remove')

  this.subscribeTo(mergeObs(adds, removes), ({ type, element }) => {
    ++this.rev

    this.$nextTick(() => {
      this.$emit(type + ':layer', element)
    })
  })
}
