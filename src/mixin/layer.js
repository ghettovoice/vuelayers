import Vue from 'vue'
import { getLayerId, initializeLayer, setLayerId } from '../ol-ext'
import { observableFromOlEvent } from '../rx-ext'
import { isEqual } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import { makeWatchers } from '../util/vue-helpers'
import cmp from './ol-virt-cmp'
import sourceContainer from './source-container'
import useMapCmp from './use-map-cmp'

export default {
  mixins: [cmp, useMapCmp, sourceContainer],
  stubVNode: {
    attrs () {
      return {
        id: this.vmId,
        class: this.vmClass,
      }
    },
  },
  props: {
    className: String,
    opacity: {
      type: Number,
      default: 1,
    },
    visible: {
      type: Boolean,
      default: true,
    },
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
    zIndex: Number,
    minResolution: Number,
    maxResolution: Number,
    minZoom: Number,
    maxZoom: Number,
    overlay: {
      type: Boolean,
      default: false,
    },
    render: Function,
  },
  watch: {
    id (value) {
      this.setId(value)
    },
    opacity (value) {
      this.setOpacity(value)
    },
    visible (value) {
      this.setVisible(value)
    },
    extent (value) {
      this.setExtent(value)
    },
    zIndex (value) {
      this.setZIndex(value)
    },
    minResolution (value) {
      this.setMinResolution(value)
    },
    maxResolution (value) {
      this.setMaxResolution(value)
    },
    minZoom (value) {
      this.setMinZoom(value)
    },
    maxZoom (value) {
      this.setMaxZoom(value)
    },
    ...makeWatchers([
      'overlay',
      'render',
    ], () => function () {
      this.scheduleRecreate()
    }),
  },
  created () {
    this::defineServices()
  },
  methods: {
    /**
     * @return {Promise<module:ol/layer/Base~BaseLayer>}
     * @protected
     */
    async createOlObject () {
      const layer = await this.createLayer()

      initializeLayer(layer, this.id)

      return layer
    },
    /**
     * @return {module:ol/layer/Base~BaseLayer|Promise<module:ol/layer/Base~BaseLayer>}
     * @protected
     * @abstract
     */
    createLayer () {
      throw new Error('Not implemented method')
    },
    /**
     * @returns {Promise<string|number>}
     */
    async getId () {
      return getLayerId(await this.resolveLayer())
    },
    /**
     * @param {string|number} id
     * @returns {Promise<void>}
     */
    async setId (id) {
      const layer = await this.resolveLayer()

      if (id === getLayerId(layer)) return

      setLayerId(layer, id)
    },
    /**
     * @returns {Promise<number[]>}
     */
    async getExtent () {
      return this.extentToDataProj((await this.resolveLayer()).getExtent())
    },
    /**
     * @param {number[]} extent
     * @returns {Promise<void>}
     */
    async setExtent (extent) {
      extent = this.extentToViewProj(extent)
      const layer = await this.resolveLayer()

      if (isEqual(extent, layer.getExtent())) return

      layer.setExtent(extent)
    },
    /**
     * @returns {Promise<number>}
     */
    async getMaxResolution () {
      return (await this.resolveLayer()).getMaxResolution()
    },
    /**
     * @param {number} resolution
     * @returns {Promise<void>}
     */
    async setMaxResolution (resolution) {
      const layer = await this.resolveLayer()

      if (resolution === layer.getMaxResolution()) return

      layer.setMaxResolution(resolution)
    },
    /**
     * @returns {Promise<number>}
     */
    async getMinResolution () {
      return (await this.resolveLayer()).getMinResolution()
    },
    /**
     * @param {number} resolution
     * @returns {Promise<void>}
     */
    async setMinResolution (resolution) {
      const layer = await this.resolveLayer()

      if (resolution === layer.getMinResolution()) return

      layer.setMinResolution(resolution)
    },
    /**
     * @returns {Promise<number>}
     */
    async getMaxZoom () {
      return (await this.resolveLayer()).getMaxZoom()
    },
    /**
     * @param {number} zoom
     * @returns {Promise<void>}
     */
    async setMaxZoom (zoom) {
      const layer = await this.resolveLayer()

      if (zoom === layer.getMaxZoom()) return

      layer.setMaxZoom(zoom)
    },
    /**
     * @returns {Promise<number>}
     */
    async getMinZoom () {
      return (await this.resolveLayer()).getMinZoom()
    },
    /**
     * @param {number} zoom
     * @returns {Promise<void>}
     */
    async setMinZoom (zoom) {
      const layer = await this.resolveLayer()

      if (zoom === layer.getMinZoom()) return

      layer.setMinZoom(zoom)
    },
    /**
     * @returns {Promise<number>}
     */
    async getOpacity () {
      return (await this.resolveLayer()).getOpacity()
    },
    /**
     * @param {number} opacity
     * @returns {Promise<void>}
     */
    async setOpacity (opacity) {
      const layer = await this.resolveLayer()

      if (opacity === layer.getOpacity()) return

      layer.setOpacity(opacity)
    },
    /**
     * @returns {Promise<boolean>}
     */
    async getVisible () {
      return (await this.resolveLayer()).getVisible()
    },
    /**
     * @param {boolean} visible
     * @returns {Promise<void>}
     */
    async setVisible (visible) {
      const layer = await this.resolveLayer()

      if (visible === layer.getVisible()) return

      layer.setVisible(visible)
    },
    /**
     * @returns {Promise<number>}
     */
    async getZIndex () {
      return (await this.resolveLayer()).getZIndex()
    },
    /**
     * @param {number} zIndex
     * @returns {Promise<void>}
     */
    async setZIndex (zIndex) {
      const layer = await this.resolveLayer()

      if (zIndex === layer.getZIndex()) return

      layer.setZIndex(zIndex)
    },
    /**
     * @param {module:ol/Map~Map|Vue|undefined} map
     * @return {Promise<void>}
     */
    async setMap (map) {
      if (map instanceof Vue) {
        map = await map.resolveMap()
      }

      (await this.resolveLayer()).setMap(map)
    },
    /**
     * @param {number[]} pixel
     * @return {boolean}
     */
    async isAtPixel (pixel) {
      const layer = await this.resolveLayer()

      return this.$mapVm.forEachLayerAtPixel(pixel, mapLayer => mapLayer === layer)
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
          get layerVm () { return vm },
        },
      )
    },
    /**
     * Updates layer state
     * @return {Promise<void>}
     */
    refresh () {
      return this::cmp.methods.refresh()
    },
    /**
     * Internal usage only in components that doesn't support refreshing.
     * @return {Promise<void>}
     * @protected
     */
    remount () {
      return this::cmp.methods.remount()
    },
    /**
     * Internal usage only in components that doesn't support refreshing.
     * @return {Promise<void>}
     * @protected
     */
    recreate () {
      return this::cmp.methods.recreate()
    },
    /**
     * @return {Promise<module:ol/layer/Base~BaseLayer>}
     * @protected
     */
    getSourceTarget () {
      return this.resolveLayer()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    init () {
      return this::cmp.methods.init()
    },
    /**
     * @return {void|Promise<void>}
     * @protected
     */
    deinit () {
      return this::cmp.methods.deinit()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async mount () {
      if (this.overlay && this.$map) {
        await this.setMap(this.$map)
      } else if (this.$layersContainer) {
        await this.$layersContainer.addLayer(this)
      }

      return this::cmp.methods.mount()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async unmount () {
      if (this.overlay) {
        await this.setMap(null)
      } else if (this.$layersContainer) {
        await this.$layersContainer.removeLayer(this)
      }

      return this::cmp.methods.unmount()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async subscribeAll () {
      await this::cmp.methods.subscribeAll()
      await this::subscribeToLayerEvents()
    },
    /**
     * @returns {Promise<module:ol/layer/Base~BaseLayer>}
     */
    async resolveLayer () {
      return this.resolveOlObject()
    },
  },
}

function defineServices () {
  Object.defineProperties(this, {
    $layer: {
      enumerable: true,
      get: () => this.$olObject,
    },
    $mapVm: {
      enumerable: true,
      get: () => this.$services?.mapVm,
    },
    $view: {
      enumerable: true,
      get: () => this.$mapVm?.$view,
    },
    $layersContainer: {
      enumerable: true,
      get: () => this.$services?.layersContainer,
    },
  })
}

async function subscribeToLayerEvents () {
  const layer = await this.resolveLayer()

  const events = observableFromOlEvent(layer, [
    // todo review which events are actually exists in the current ol version
    'postcompose',
    'precompose',
    'render',
    'postrender',
    'prerender',
  ])

  this.subscribeTo(events, evt => {
    ++this.rev

    this.$nextTick(() => {
      this.$emit(evt.type, evt)
    })
  })
}
