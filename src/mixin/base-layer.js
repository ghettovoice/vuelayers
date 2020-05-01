import { merge as mergeObs } from 'rxjs'
import { getLayerId, initializeLayer, setLayerId } from '../ol-ext'
import { obsFromOlChangeEvent, obsFromOlEvent } from '../rx-ext'
import { isEqual, isNumber, pick, waitFor } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import olCmp from './ol-cmp'
import stubVNode from './stub-vnode'

/**
 * Base layer mixin.
 */
export default {
  mixins: [
    stubVNode,
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
    /**
     * A CSS class name to set to the layer element.
     * @type {string}
     */
    className: {
      type: String,
      default: 'ol-layer',
    },
    /**
     * @type {number}
     */
    opacity: {
      type: Number,
      default: 1,
    },
    /**
     * @type {boolean}
     */
    visible: {
      type: Boolean,
      default: true,
    },
    /**
     * @type {number[]}
     */
    extent: {
      type: Array,
      validator: value => value.length === 4 && value.every(isNumber),
    },
    /**
     * @type {number|undefined}
     */
    zIndex: Number,
    /**
     * @type {number|undefined}
     */
    minResolution: Number,
    /**
     * @type {number|undefined}
     */
    maxResolution: Number,
    /**
     * @type {number|undefined}
     */
    minZoom: Number,
    /**
     * @type {number|undefined}
     */
    maxZoom: Number,
  },
  watch: {
    async id (value) {
      await this.setId(value)
    },
    async opacity (value) {
      await this.setOpacity(value)
    },
    async visible (value) {
      await this.setVisible(value)
    },
    async extent (value) {
      await this.setExtent(value)
    },
    async zIndex (value) {
      await this.setZIndex(value)
    },
    async minResolution (value) {
      await this.setMinResolution(value)
    },
    async maxResolution (value) {
      await this.setMaxResolution(value)
    },
    async minZoom (value) {
      await this.setMinZoom(value)
    },
    async maxZoom (value) {
      await this.setMaxZoom(value)
    },
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
      return initializeLayer(await this.createLayer(), this.id)
    },
    /**
     * @return {module:ol/layer/Base~BaseLayer|Promise<module:ol/layer/Base~BaseLayer>}
     * @protected
     * @abstract
     */
    createLayer () {
      throw new Error('Not implemented method: createLayer')
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
      const extent = (await this.resolveLayer()).getExtent()

      return this.extentToDataProj(extent)
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
     * @param {number[]} pixel
     * @return {boolean}
     */
    async isAtPixel (pixel) {
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
      if (this.$layersContainer) {
        await this.$layersContainer.addLayer(this)
      }

      return this::olCmp.methods.mount()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async unmount () {
      if (this.$layersContainer) {
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
    /**
     * @return {Promise<module:ol/layer/Base~BaseLayer>}
     */
    resolveLayer: olCmp.methods.resolveOlObject,
    ...pick(olCmp.methods, [
      'deinit',
      'refresh',
      'scheduleRefresh',
      'remount',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'resolveOlObject',
    ]),
  },
}

function defineServices () {
  Object.defineProperties(this, {
    /**
     * @type {module:ol/layer/Base~BaseLayer|undefined}
     */
    $layer: {
      enumerable: true,
      get: () => this.$olObject,
    },
    /**
     * @type {Object|undefined}
     */
    $mapVm: {
      enumerable: true,
      get: () => this.$services?.mapVm,
    },
    /**
     * @type {Object|undefined}
     */
    $viewVm: {
      enumerable: true,
      get: () => this.$services?.viewVm,
    },
    /**
     * @type {Object|undefined}
     */
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

    this.$emit(evt.type, evt)
  })
}
