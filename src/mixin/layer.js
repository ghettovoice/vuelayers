import Vue from 'vue'
import { getLayerId, initializeLayer, setLayerId } from '../ol-ext'
import { hasLayer, hasMap } from '../util/assert'
import { isEqual } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import { observableFromOlEvent } from '../rx-ext'
import { makeWatchers } from '../util/vue-helpers'
import cmp from './ol-virt-cmp'
import sourceContainer from './source-container'
import useMapCmp from './use-map-cmp'

export default {
  mixins: [cmp, useMapCmp, sourceContainer],
  props: {
    /**
     * The bounding extent for layer rendering defined in the map view projection.
     * The layer will not be rendered outside of this extent.
     * @default undefined
     * @type {number[]|undefined}
     */
    extent: {
      type: Array,
      validator: value => value.length === 4,
    },
    minResolution: Number,
    maxResolution: Number,
    opacity: {
      type: Number,
      default: 1,
    },
    overlay: {
      type: Boolean,
      default: false,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    zIndex: Number,
  },
  methods: {
    /**
     * @return {Promise<module:ol/layer/BaseLayer~BaseLayer>}
     * @protected
     */
    async createOlObject () {
      let layer = await this.createLayer()

      initializeLayer(layer, this.id)

      return layer
    },
    /**
     * @return {module:ol/layer/BaseLayer~BaseLayer|Promise<module:ol/layer/BaseLayer~BaseLayer>}
     * @protected
     * @abstract
     */
    createLayer () {
      throw new Error('Not implemented method')
    },
    /**
     * @return {Promise<Vue<module:ol/layer/BaseLayer~BaseLayer>>}
     * @protected
     */
    init () {
      return this::cmp.methods.init()
    },
    /**
     * @return {void|Promise}
     * @protected
     */
    deinit () {
      return this::cmp.methods.deinit()
    },
    /**
     * @param {number[]} pixel
     * @return {boolean}
     */
    isAtPixel (pixel) {
      hasMap(this)

      return this.$map.forEachLayerAtPixel(pixel, layer => layer === this.$layer)
    },
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(
        this::cmp.methods.getServices(),
        this::sourceContainer.methods.getServices(),
        {
          get layer () { return vm.$layer },
        },
      )
    },
    /**
     * @return {{
     *     setSource: function(module:ol/source/Source~Source): void,
     *     getSource: function(): module:ol/source/Source~Source
     *   }|undefined}
     * @protected
     */
    getSourceTarget () {
      return this.$layer
    },
    /**
     * @return {Promise}
     * @protected
     */
    mount () {
      if (this.overlay && this.$map) {
        this.setMap(this.$map)
      } else if (this.$layersContainer) {
        this.$layersContainer.addLayer(this)
      }

      return this::cmp.methods.mount()
    },
    /**
     * @return {Promise}
     * @protected
     */
    unmount () {
      if (this.overlay) {
        this.setMap(undefined)
      } else if (this.$layersContainer) {
        this.$layersContainer.removeLayer(this)
      }

      return this::cmp.methods.unmount()
    },
    /**
     * Updates layer state
     * @return {Promise}
     */
    refresh () {
      return this::cmp.methods.refresh()
    },
    /**
     * Internal usage only in components that doesn't support refreshing.
     * @return {Promise}
     * @protected
     */
    remount () {
      return this::cmp.methods.remount()
    },
    /**
     * Internal usage only in components that doesn't support refreshing.
     * @return {Promise}
     * @protected
     */
    recreate () {
      return this::cmp.methods.remount()
    },
    /**
     * @protected
     */
    subscribeAll () {
      this::cmp.methods.subscribeAll()
      this::subscribeToLayerEvents()
    },
    /**
     * @param {module:ol/Map~Map|Vue|undefined} map
     */
    setMap (map) {
      hasLayer(this)

      map = map instanceof Vue ? map.$map : map

      this.$layer.setMap(map)
    },
  },
  watch: {
    id (value) {
      if (!this.$layer || value === getLayerId(this.$layer)) {
        return
      }

      setLayerId(this.$layer, value)
    },
    maxResolution (value) {
      if (!this.$layer || value === this.$layer.getMaxResolution()) {
        return
      }

      this.$layer.setMaxResolution(value)
    },
    minResolution (value) {
      if (!this.$layer || value === this.$layer.getMinResolution()) {
        return
      }

      this.$layer.setMinResolution(value)
    },
    opacity (value) {
      if (!this.$layer || value === this.$layer.getOpacity()) {
        return
      }

      this.$layer.setOpacity(value)
    },
    visible (value) {
      if (!this.$layer || value === this.$layer.getVisible()) {
        return
      }

      this.$layer.setVisible(value)
    },
    zIndex (value) {
      if (!this.$layer || value === this.$layer.getZIndex()) {
        return
      }

      this.$layer.setZIndex(value)
    },
    extent (value) {
      if (!this.$layer || isEqual(value, this.$layer.getExtent())) {
        return
      }

      this.$layer.setExtent(value)
    },
    ...makeWatchers([
      'overlay',
    ], () => function () {
      this.scheduleRecreate()
    }),
  },
  stubVNode: {
    attrs () {
      return {
        id: this.vmId,
        class: this.cmpName,
      }
    },
  },
  created () {
    this::defineServices()
  },
}

function defineServices () {
  Object.defineProperties(this, {
    $layer: {
      enumerable: true,
      get: () => this.$olObject,
    },
    $source: {
      enumerable: true,
      get: this.getSource,
    },
    $map: {
      enumerable: true,
      get: () => this.$services && this.$services.map,
    },
    $view: {
      enumerable: true,
      get: () => this.$services && this.$services.view,
    },
    $layersContainer: {
      enumerable: true,
      get: () => this.$services && this.$services.layersContainer,
    },
  })
}

function subscribeToLayerEvents () {
  hasLayer(this)

  const events = observableFromOlEvent(this.$layer, [
    'postcompose',
    'precompose',
    'render',
  ])

  this.subscribeTo(events, evt => {
    ++this.rev

    this.$nextTick(() => {
      this.$emit(evt.type, evt)
    })
  })
}
