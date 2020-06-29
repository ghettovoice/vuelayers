import debounce from 'debounce-promise'
import { get as getProj } from 'ol/proj'
import { from as fromObs, merge as mergeObs } from 'rxjs'
import { map as mapObs, mergeMap, skipWhile } from 'rxjs/operators'
import { getLayerId, initializeLayer, roundExtent, setLayerId, transformExtent } from '../ol-ext'
import {
  fromOlChangeEvent as obsFromOlChangeEvent,
  fromVueEvent as obsFromVueEvent,
  fromVueWatcher as obsFromVueWatcher,
} from '../rx-ext'
import { assert, addPrefix, hasProp, isEqual, isNumber, pick, mergeDescriptors, waitFor } from '../util'
import olCmp, { FRAME_TIME, OlObjectEvent } from './ol-cmp'
import projTransforms from './proj-transforms'
import stubVNode from './stub-vnode'

/**
 * Base layer mixin.
 */
export default {
  mixins: [
    stubVNode,
    projTransforms,
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
     * @type {number[]|undefined}
     */
    extent: {
      type: Array,
      validator: value => value.length === 4 && value.every(isNumber),
    },
    extentProjection: {
      type: String,
      validator: value => !!getProj(value),
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
  data () {
    return {
      dataProjection: null,
    }
  },
  computed: {
    resolvedExtentProjection () {
      return this.extentProjection || this.resolvedDataProjection
    },
    extentDataProj () {
      return roundExtent(this.extent)
    },
    extentViewProj () {
      return transformExtent(this.extent, this.resolvedExtentProjection, this.viewProjection)
    },
    currentExtentDataProj () {
      if (this.rev && this.$layer) {
        return this.getExtentInternal()
      }

      return this.extentDataProj
    },
    currentExtentViewProj () {
      if (this.rev && this.$layer) {
        return this.getExtentInternal(true)
      }

      return this.extentViewProj
    },
    currentMaxResolution () {
      if (this.rev && this.$layer) {
        return this.getMaxResolutionInternal()
      }

      return this.maxResolution
    },
    currentMinResolution () {
      if (this.rev && this.$layer) {
        return this.getMinResolutionInternal()
      }

      return this.minResolution
    },
    currentMaxZoom () {
      if (this.rev && this.$layer) {
        return this.getMaxZoomInternal()
      }

      return this.maxZoom
    },
    currentMinZoom () {
      if (this.rev && this.$layer) {
        return this.getMinZoomInternal()
      }

      return this.minZoom
    },
    currentOpacity () {
      if (this.rev && this.$layer) {
        return this.getOpacityInternal()
      }

      return this.opacity
    },
    currentVisible () {
      if (this.rev && this.$layer) {
        return this.getVisibleInternal()
      }

      return this.visible
    },
    currentZIndex () {
      if (this.rev && this.$layer) {
        return this.getZIndexInternal()
      }

      return this.zIndex
    },
  },
  watch: {
    async opacity (value) {
      await this.setOpacity(value)
    },
    currentOpacity: /*#__PURE__*/debounce(function (value) {
      if (value === this.opacity) return

      this.$emit('update:opacity', value)
    }, FRAME_TIME),
    async visible (value) {
      await this.setVisible(value)
    },
    currentVisible: /*#__PURE__*/debounce(function (value) {
      if (value === this.visible) return

      this.$emit('update:visible', value)
    }, FRAME_TIME),
    async extentDataProj (value) {
      await this.setExtent(value)
    },
    currentExtentDataProj: /*#__PURE__*/debounce(function (value) {
      if (isEqual(value, this.extentDataProj)) return

      this.$emit('update:extent', value.slice())
    }, FRAME_TIME),
    async zIndex (value) {
      await this.setZIndex(value)
    },
    currentZIndex: /*#__PURE__*/debounce(function (value) {
      if (value === this.zIndex) return

      this.$emit('update:zIndex', value)
    }, FRAME_TIME),
    async minResolution (value) {
      await this.setMinResolution(value)
    },
    currentMinResolution: /*#__PURE__*/debounce(function (value) {
      if (value === this.minResolution) return

      this.$emit('update:minResolution', value)
    }, FRAME_TIME),
    async maxResolution (value) {
      await this.setMaxResolution(value)
    },
    currentMaxResolution: /*#__PURE__*/debounce(function (value) {
      if (value === this.maxResolution) return

      this.$emit('update:maxResolution', value)
    }, FRAME_TIME),
    async minZoom (value) {
      await this.setMinZoom(value)
    },
    currentMinZoom: /*#__PURE__*/debounce(function (value) {
      if (value === this.minZoom) return

      this.$emit('update:minZoom', value)
    }, FRAME_TIME),
    async maxZoom (value) {
      await this.setMaxZoom(value)
    },
    currentMaxZoom: /*#__PURE__*/debounce(function (value) {
      if (value === this.maxZoom) return

      this.$emit('update:maxZoom', value)
    }, FRAME_TIME),
  },
  created () {
    this::defineServices()
  },
  methods: {
    /**
     * @returns {Promise<void>}
     * @protected
     */
    async beforeInit () {
      try {
        await waitFor(
          () => this.$mapVm != null,
          obsFromVueEvent(this.$eventBus, [
            OlObjectEvent.CREATE_ERROR,
          ]).pipe(
            mapObs(([vm]) => hasProp(vm, '$map') && this.$vq.closest(vm)),
          ),
          1000,
        )
        this.dataProjection = this.$mapVm.resolvedDataProjection
        const dataProjChanges = obsFromVueWatcher(this, () => this.$mapVm.resolvedDataProjection)
        this.subscribeTo(dataProjChanges, ({ value }) => { this.dataProjection = value })
        await this.$nextTickPromise()

        return this::olCmp.methods.beforeInit()
      } catch (err) {
        err.message = 'Wait for $mapVm injection: ' + err.message
        throw err
      }
    },
    /**
     * @return {Promise<module:ol/layer/Base~BaseLayer>}
     * @protected
     */
    async createOlObject () {
      return initializeLayer(await this.createLayer(), this.currentId)
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
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::olCmp.methods.subscribeAll()
      this::subscribeToLayerEvents()
    },
    /**
     * @return {Promise<module:ol/layer/Base~BaseLayer>}
     */
    resolveLayer: olCmp.methods.resolveOlObject,
    .../*#__PURE__*/pick(olCmp.methods, [
      'init',
      'deinit',
      'beforeMount',
      'refresh',
      'scheduleRefresh',
      'remount',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'resolveOlObject',
    ]),
    /**
     * @returns {string|number}
     * @protected
     */
    getIdInternal () {
      return getLayerId(this.$layer)
    },
    /**
     * @param {string|number} id
     * @returns {void}
     * @protected
     */
    setIdInternal (id) {
      assert(id != null && id !== '', 'Invalid layer id')

      if (id === this.getIdInternal()) return

      setLayerId(this.$layer, id)
    },
    /**
     * @param {boolean} [viewProj=false]
     * @returns {Promise<number[]|undefined>}
     */
    async getExtent (viewProj = false) {
      await this.resolveLayer()

      return this.getExtentInternal(viewProj)
    },
    /**
     * @param {boolean} [viewProj=false]
     * @return {number[]|undefined}
     * @protected
     */
    getExtentInternal (viewProj = false) {
      if (viewProj) return roundExtent(this.$layer.getExtent())

      return transformExtent(this.$layer.getExtent(), this.viewProjection, this.resolvedExtentProjection)
    },
    /**
     * @param {number[]} extent
     * @param {boolean} [viewProj=false]
     * @returns {Promise<void>}
     */
    async setExtent (extent, viewProj = false) {
      extent = roundExtent(extent)
      if (isEqual(extent, await this.getExtent(viewProj))) return
      if (!viewProj) {
        extent = transformExtent(extent, this.resolvedExtentProjection, this.resolvedDataProjection)
      }

      (await this.resolveLayer()).setExtent(extent)
    },
    /**
     * @returns {Promise<number|undefined>}
     */
    async getMaxResolution () {
      await this.resolveLayer()

      return this.getMaxResolutionInternal()
    },
    /**
     * @return {number|undefined}
     * @protected
     */
    getMaxResolutionInternal () {
      return this.$layer.getMaxResolution()
    },
    /**
     * @param {number} resolution
     * @returns {Promise<void>}
     */
    async setMaxResolution (resolution) {
      if (resolution === await this.getMaxResolution()) return

      (await this.resolveLayer()).setMaxResolution(resolution)
    },
    /**
     * @returns {Promise<number|undefined>}
     */
    async getMinResolution () {
      await this.resolveLayer()

      return this.getMinResolutionInternal()
    },
    /**
     * @return {number|undefined}
     * @protected
     */
    getMinResolutionInternal () {
      return this.$layer.getMinResolution()
    },
    /**
     * @param {number} resolution
     * @returns {Promise<void>}
     */
    async setMinResolution (resolution) {
      if (resolution === await this.getMinResolution()) return

      (await this.resolveLayer()).setMinResolution(resolution)
    },
    /**
     * @returns {Promise<number>}
     */
    async getMaxZoom () {
      await this.resolveLayer()

      return this.getMaxZoomInternal()
    },
    /**
     * @return {number}
     * @protected
     */
    getMaxZoomInternal () {
      return this.$layer.getMaxZoom()
    },
    /**
     * @param {number} zoom
     * @returns {Promise<void>}
     */
    async setMaxZoom (zoom) {
      if (zoom === await this.getMaxZoom()) return

      (await this.resolveLayer()).setMaxZoom(zoom)
    },
    /**
     * @returns {Promise<number>}
     */
    async getMinZoom () {
      await this.resolveLayer()

      return this.getMinZoomInternal()
    },
    /**
     * @return {number}
     * @protected
     */
    getMinZoomInternal () {
      return this.$layer.getMinZoom()
    },
    /**
     * @param {number} zoom
     * @returns {Promise<void>}
     */
    async setMinZoom (zoom) {
      if (zoom === await this.getMinZoom()) return

      (await this.resolveLayer()).setMinZoom(zoom)
    },
    /**
     * @returns {Promise<number>}
     */
    async getOpacity () {
      await this.resolveLayer()

      return this.getOpacityInternal()
    },
    /**
     * @return {number}
     * @protected
     */
    getOpacityInternal () {
      return this.$layer.getOpacity()
    },
    /**
     * @param {number} opacity
     * @returns {Promise<void>}
     */
    async setOpacity (opacity) {
      if (opacity === await this.getOpacity()) return

      (await this.resolveLayer()).setOpacity(opacity)
    },
    /**
     * @returns {Promise<boolean>}
     */
    async getVisible () {
      await this.resolveLayer()

      return this.getVisibleInternal()
    },
    /**
     * @return {boolean}
     * @protected
     */
    getVisibleInternal () {
      return this.$layer.getVisible()
    },
    /**
     * @param {boolean} visible
     * @returns {Promise<void>}
     */
    async setVisible (visible) {
      if (visible === await this.getVisible()) return

      (await this.resolveLayer()).setVisible(visible)
    },
    /**
     * @returns {Promise<number>}
     */
    async getZIndex () {
      await this.resolveLayer()

      return this.getZIndexInternal()
    },
    /**
     * @return {number}
     * @protected
     */
    getZIndexInternal () {
      return this.$layer.getZIndex()
    },
    /**
     * @param {number} zIndex
     * @returns {Promise<void>}
     */
    async setZIndex (zIndex) {
      if (zIndex === await this.getZIndex()) return

      (await this.resolveLayer()).setZIndex(zIndex)
    },
    /**
     * @param {number[]} pixel
     * @return {boolean}
     */
    async isAtPixel (pixel) {
      const layer = await this.resolveLayer()

      return this.$mapVm.forEachLayerAtPixel(pixel, mapLayer => mapLayer === layer)
    },
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
  const prefixKey = addPrefix('current')
  const propChanges = mergeObs(
    obsFromOlChangeEvent(this.$layer, [
      'id',
      'opacity',
      'visible',
      'zIndex',
      'minResolution',
      'maxResolution',
      'minZoom',
      'maxZoom',
    ], true, evt => ({
      ...evt,
      compareWith: this[prefixKey(evt.prop)],
    })),
    obsFromOlChangeEvent(this.$layer, 'extent', true).pipe(
      mergeMap(({ prop }) => fromObs(this.getExtent()).pipe(
        mapObs(extent => ({
          prop,
          value: extent,
          compareWith: this.currentExtentDataProj,
        })),
      )),
    ),
  ).pipe(
    skipWhile(({ value, compareWith }) => isEqual(value, compareWith)),
  )
  this.subscribeTo(propChanges, () => {
    ++this.rev
  })
}
