import { merge as mergeObs } from 'rxjs/observable'
import Vue from 'vue'
import { getLayerId, initializeLayer, setLayerId } from '../ol-ext'
import { obsFromOlChangeEvent, obsFromOlEvent } from '../rx-ext'
import { isEqual, pick, waitFor } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import { makeWatchers } from '../util/vue-helpers'
import olCmp from './ol-cmp'
import sourceContainer from './source-container'
import stubVNode from './stub-vnode'

export default {
  mixins: [
    stubVNode,
    sourceContainer,
    olCmp,
  ],
  stubVNode: {
    attrs () {
      return {
        id: this.vmId,
        class: this.vmClass,
      }
    },
  },
  props: {
    // ol/layer/Base
    className: String,
    opacity: {
      type: Number,
      default: 1,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    extent: {
      type: Array,
      validator: value => value.length === 4,
    },
    zIndex: Number,
    minResolution: Number,
    maxResolution: Number,
    minZoom: Number,
    maxZoom: Number,
    render: Function,
    // custom
    overlay: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    id (value) {
      this.setLayerId(value)
    },
    opacity (value) {
      this.setLayerOpacity(value)
    },
    visible (value) {
      this.setLayerVisible(value)
    },
    extent (value) {
      this.setLayerExtent(value)
    },
    zIndex (value) {
      this.setLayerZIndex(value)
    },
    minResolution (value) {
      this.setLayerMinResolution(value)
    },
    maxResolution (value) {
      this.setLayerMaxResolution(value)
    },
    minZoom (value) {
      this.setLayerMinZoom(value)
    },
    maxZoom (value) {
      this.setLayerMaxZoom(value)
    },
    ...makeWatchers([
      'overlay',
      'render',
    ], () => olCmp.methods.scheduleRecreate),
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
    async getLayerId () {
      return getLayerId(await this.resolveLayer())
    },
    /**
     * @param {string|number} id
     * @returns {Promise<void>}
     */
    async setLayerId (id) {
      const layer = await this.resolveLayer()

      if (id === getLayerId(layer)) return

      setLayerId(layer, id)
    },
    /**
     * @returns {Promise<number[]>}
     */
    async getLayerExtent () {
      return this.extentToDataProj((await this.resolveLayer()).getExtent())
    },
    /**
     * @param {number[]} extent
     * @returns {Promise<void>}
     */
    async setLayerExtent (extent) {
      extent = this.extentToViewProj(extent)
      const layer = await this.resolveLayer()

      if (isEqual(extent, layer.getExtent())) return

      layer.setExtent(extent)
    },
    /**
     * @returns {Promise<number>}
     */
    async getLayerMaxResolution () {
      return (await this.resolveLayer()).getMaxResolution()
    },
    /**
     * @param {number} resolution
     * @returns {Promise<void>}
     */
    async setLayerMaxResolution (resolution) {
      const layer = await this.resolveLayer()

      if (resolution === layer.getMaxResolution()) return

      layer.setMaxResolution(resolution)
    },
    /**
     * @returns {Promise<number>}
     */
    async getLayerMinResolution () {
      return (await this.resolveLayer()).getMinResolution()
    },
    /**
     * @param {number} resolution
     * @returns {Promise<void>}
     */
    async setLayerMinResolution (resolution) {
      const layer = await this.resolveLayer()

      if (resolution === layer.getMinResolution()) return

      layer.setMinResolution(resolution)
    },
    /**
     * @returns {Promise<number>}
     */
    async getLayerMaxZoom () {
      return (await this.resolveLayer()).getMaxZoom()
    },
    /**
     * @param {number} zoom
     * @returns {Promise<void>}
     */
    async setLayerMaxZoom (zoom) {
      const layer = await this.resolveLayer()

      if (zoom === layer.getMaxZoom()) return

      layer.setMaxZoom(zoom)
    },
    /**
     * @returns {Promise<number>}
     */
    async getLayerMinZoom () {
      return (await this.resolveLayer()).getMinZoom()
    },
    /**
     * @param {number} zoom
     * @returns {Promise<void>}
     */
    async setLayerMinZoom (zoom) {
      const layer = await this.resolveLayer()

      if (zoom === layer.getMinZoom()) return

      layer.setMinZoom(zoom)
    },
    /**
     * @returns {Promise<number>}
     */
    async getLayerOpacity () {
      return (await this.resolveLayer()).getOpacity()
    },
    /**
     * @param {number} opacity
     * @returns {Promise<void>}
     */
    async setLayerOpacity (opacity) {
      const layer = await this.resolveLayer()

      if (opacity === layer.getOpacity()) return

      layer.setOpacity(opacity)
    },
    /**
     * @returns {Promise<boolean>}
     */
    async getLayerVisible () {
      return (await this.resolveLayer()).getVisible()
    },
    /**
     * @param {boolean} visible
     * @returns {Promise<void>}
     */
    async setLayerVisible (visible) {
      const layer = await this.resolveLayer()

      if (visible === layer.getVisible()) return

      layer.setVisible(visible)
    },
    /**
     * @returns {Promise<number>}
     */
    async getLayerZIndex () {
      return (await this.resolveLayer()).getZIndex()
    },
    /**
     * @param {number} zIndex
     * @returns {Promise<void>}
     */
    async setLayerZIndex (zIndex) {
      const layer = await this.resolveLayer()

      if (zIndex === layer.getZIndex()) return

      layer.setZIndex(zIndex)
    },
    /**
     * @param {module:ol/Map~Map|Vue|undefined} map
     * @return {Promise<void>}
     */
    async setLayerMap (map) {
      if (map instanceof Vue) {
        map = await map.resolveMap()
      }

      (await this.resolveLayer()).setMap(map)
    },
    /**
     * @return {Promise<module:ol/layer/Base~BaseLayer>}
     * @protected
     */
    getSourceTarget: olCmp.methods.resolveOlObject,
    /**
     * @returns {Promise<module:ol/sourceSource~Source|undefined>}
     */
    getLayerSource: sourceContainer.methods.getSource,
    /**
     * @param {module:ol/sourceSource~Source|undefined} source
     * @returns {Promise<void>}
     */
    setLayerSource: sourceContainer.methods.setSource,
    /**
     * @param {number[]} pixel
     * @return {boolean}
     */
    async isLayerAtPixel (pixel) {
      const layer = await this.resolveLayer()

      return this.$mapVm.forEachLayerAtPixel(pixel, mapLayer => mapLayer === layer)
    },
    /**
     * @returns {Promise<void>}
     * @protected
     */
    async init () {
      await waitFor(() => this.$mapVm != null)

      return this::olCmp.methods.init()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async mount () {
      if (this.overlay && this.$map) {
        await this.setLayerMap(this.$map)
      } else if (this.$layersContainer) {
        await this.$layersContainer.addLayer(this)
      }

      return this::olCmp.methods.mount()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async unmount () {
      if (this.overlay) {
        await this.setLayerMap(null)
      } else if (this.$layersContainer) {
        await this.$layersContainer.removeLayer(this)
      }

      return this::olCmp.methods.unmount()
    },
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(
        this::olCmp.methods.getServices(),
        this::sourceContainer.methods.getServices(),
        {
          get layerVm () { return vm },
        },
      )
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async subscribeAll () {
      await Promise.all([
        this::olCmp.methods.subscribeAll(),
        this::subscribeToLayerEvents(),
      ])
    },
    resolveLayer: olCmp.methods.resolveOlObject,
    ...pick(olCmp.methods, [
      'deinit',
      'refresh',
      'scheduleRefresh',
      'remount',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
    ]),
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
      get: () => this.$layer?.getSource(),
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

  const t = 1000 / 60
  const changes = mergeObs(
    obsFromOlChangeEvent(layer, 'extent', true, t, () => this.extentToDataProj(layer.getExtent())),
    obsFromOlChangeEvent(layer, [
      'id',
      'opacity',
      'visible',
      'zIndex',
      'minResolution',
      'maxResolution',
      'minZoom',
      'maxZoom',
    ], true, t),
  )

  this.subscribeTo(changes, ({ prop, value }) => {
    ++this.rev

    this.$nextTick(() => {
      this.$emit(`update:${prop}`, value)
    })
  })

  const events = obsFromOlEvent(layer, [
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
