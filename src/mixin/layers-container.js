import debounce from 'debounce-promise'
import { Collection } from 'ol'
import CollectionEventType from 'ol/CollectionEventType'
import BaseLayer from 'ol/layer/Base'
import { from as fromObs, merge as mergeObs } from 'rxjs'
import { map as mapObs, mergeMap } from 'rxjs/operators'
import { getLayerId, initializeLayer } from '../ol-ext'
import { bufferDebounceTime, fromOlEvent as obsFromOlEvent } from '../rx-ext'
import { instanceOf } from '../util/assert'
import { isFunction, map, forEach, find, isEqual } from '../util/minilo'
import identMap from './ident-map'
import { FRAME_TIME } from './ol-cmp'
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
    /**
     * @returns {string[]}
     */
    currentLayers () {
      if (!this.rev) return []

      return map(this.getLayers(), getLayerId)
    },
    /**
     * @returns {string|undefined}
     */
    layersCollectionIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'layers_collection')
    },
  },
  watch: {
    currentLayers: debounce(function (value, prev) {
      if (isEqual(value, prev)) return

      this.$emit('update:layers', value.slice())
    }, FRAME_TIME),
    layersCollectionIdent (value, prevValue) {
      if (value && prevValue) {
        this.moveInstance(value, prevValue)
      } else if (value && !prevValue && this.$layersCollection) {
        this.setInstance(value, this.$layersCollection)
      } else if (!value && prevValue) {
        this.unsetInstance(prevValue)
      }
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
     * @returns {{readonly layersContainer: Object}}
     * @protected
     */
    getServices () {
      const vm = this

      return {
        get layersContainer () { return vm },
      }
    },
    /**
     * @param {LayerLike} layer
     * @return {Promise<BaseLayer>}
     */
    async initializeLayer (layer) {
      if (isFunction(layer.resolveOlObject)) {
        layer = await layer.resolveOlObject()
      }

      return initializeLayer(layer)
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
     * @return {Promise<void>}
     */
    async addLayer (layer) {
      layer = await this.initializeLayer(layer)
      instanceOf(layer, BaseLayer)

      if (this.getLayerById(getLayerId(layer)) == null) {
        this.$layersCollection.push(layer)
      }
    },
    /**
     * @param {LayerLike[]|module:ol/Collection~Collection<LayerLike>} layers
     * @returns {Promise<void>}
     */
    async removeLayers (layers) {
      await Promise.all(map(layers, ::this.removeLayer))
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
     * @return {void}
     */
    clearLayers () {
      this.$layersCollection.clear()
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
      return find(this.getLayers(), layer => {
        return getLayerId(layer) === layerId
      })
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
  const adds = obsFromOlEvent(this.$layersCollection, CollectionEventType.ADD).pipe(
    mergeMap(({ type, element }) => fromObs(this.initializeLayer(element)).pipe(
      mapObs(element => ({ type, element })),
    )),
  )
  const removes = obsFromOlEvent(this.$layersCollection, CollectionEventType.REMOVE)
  const events = mergeObs(adds, removes).pipe(
    bufferDebounceTime(FRAME_TIME),
  )
  this.subscribeTo(events, events => {
    ++this.rev

    this.$nextTick(() => {
      forEach(events, ({ type, element }) => {
        this.$emit(type + 'layer', element)
        // todo remove in v0.13.x
        this.$emit(type + ':layer', element)
      })
    })
  })
}
