import { Collection } from 'ol'
import CollectionEventType from 'ol/CollectionEventType'
import BaseLayer from 'ol/layer/Base'
import { getUid } from 'ol/util'
import { merge as mergeObs } from 'rxjs'
import { map as mapObs, tap } from 'rxjs/operators'
import { getLayerId, initializeLayer } from '../ol-ext'
import { bufferDebounceTime, fromOlChangeEvent as obsFromOlChangeEvent, fromOlEvent as obsFromOlEvent } from '../rx-ext'
import { find, forEach, instanceOf } from '../utils'
import identMap from './ident-map'
import { FRAME_TIME, makeChangeOrRecreateWatchers } from './ol-cmp'
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
     * @returns {string|undefined}
     */
    layersCollectionIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'layers_collection')
    },
  },
  watch: {
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'layersCollectionIdent',
    ]),
  },
  created () {
    /**
     * @type {module:ol/Collection~Collection<module:ol/layer/Base~BaseLayer>}
     * @private
     */
    this._layersCollection = this.instanceFactoryCall(this.layersCollectionIdent, () => new Collection())
    this._layerSubs = {}

    this::defineServices()
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
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToCollectionEvents()
    },
    /**
     * @param {LayerLike} layer
     * @return {BaseLayer}
     */
    initializeLayer (layer) {
      layer = layer?.$layer || layer
      instanceOf(layer, BaseLayer)

      return initializeLayer(layer)
    },
    /**
     * @param {LayerLike[]|module:ol/Collection~Collection<LayerLike>} layers
     */
    addLayers (layers) {
      forEach(layers, ::this.addLayer)
    },
    /**
     * @param {LayerLike} layer
     */
    addLayer (layer) {
      layer = this.initializeLayer(layer)

      if (this.getLayerById(getLayerId(layer))) return

      this.$layersCollection.push(layer)
    },
    /**
     * @param {LayerLike[]|module:ol/Collection~Collection<LayerLike>} layers
     */
    removeLayers (layers) {
      forEach(layers, ::this.removeLayer)
    },
    /**
     * @param {LayerLike} layer
     */
    removeLayer (layer) {
      layer = this.getLayerById(getLayerId(layer?.$layer || layer))
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
      return this.$layersCollection.getArray().slice()
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
      return find(this.getLayers(), layer => getLayerId(layer) === layerId)
    },
    /**
     * @param {string|undefined} value
     * @param {string|undefined} prevValue
     * @protected
     */
    layersCollectionIdentChanged (value, prevValue) {
      if (value && prevValue) {
        this.moveInstance(value, prevValue)
      } else if (value && !prevValue && this.$layersCollection) {
        this.setInstance(value, this.$layersCollection)
      } else if (!value && prevValue) {
        this.unsetInstance(prevValue)
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
  const adds = obsFromOlEvent(this.$layersCollection, CollectionEventType.ADD).pipe(
    mapObs(evt => ({
      ...evt,
      element: this.initializeLayer(evt.element),
    })),
    tap(({ element }) => {
      const uid = getUid(element)
      const propChanges = obsFromOlChangeEvent(element, 'id', true)
      this._layerSubs[uid] = this.subscribeTo(propChanges, ::this.scheduleRefresh)
    }),
  )
  const removes = obsFromOlEvent(this.$layersCollection, CollectionEventType.REMOVE).pipe(
    tap(({ element }) => {
      const uid = getUid(element)
      if (this._layerSubs[uid]) {
        this.unsubscribe(this._layerSubs[uid])
        delete this._layerSubs[uid]
      }
    }),
  )
  const events = mergeObs(adds, removes).pipe(
    bufferDebounceTime(FRAME_TIME),
  )
  this.subscribeTo(events, async events => {
    await this.debounceChanged()
    forEach(events, ({ type, element }) => {
      this.$emit(type + 'layer', element)
      // todo remove in v0.13.x
      this.$emit(type + ':layer', element)
    })
  })
}
