import { get as getProj } from 'ol/proj'
import { EPSG_3857, getLayerId, initializeLayer, roundExtent, setLayerId, transformExtent } from '../ol-ext'
import { fromOlChangeEvent as obsFromOlChangeEvent } from '../rx-ext'
import { addPrefix, assert, coalesce, isArray, isEqual, isNumber, mergeDescriptors } from '../utils'
import olCmp, { makeChangeOrRecreateWatchers } from './ol-cmp'
import projTransforms from './proj-transforms'
import stubVNode from './stub-vnode'
import waitForMap from './wait-for-map'

/**
 * Base layer mixin.
 */
export default {
  mixins: [
    stubVNode,
    projTransforms,
    olCmp,
    waitForMap,
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
    /**
     * @type {string|undefined}
     */
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
      viewProjection: EPSG_3857,
      dataProjection: EPSG_3857,
      currentExtentViewProj: roundExtent(this.extent),
      currentMaxResolution: this.maxResolution,
      currentMinResolution: this.minResolution,
      currentMaxZoom: this.maxZoom,
      currentMinZoom: this.minZoom,
      currentOpacity: this.opacity,
      currentVisible: this.visible,
      currentZIndex: this.zIndex,
    }
  },
  computed: {
    resolvedExtentProjection () {
      return coalesce(this.extentProjection, this.resolvedDataProjection)
    },
    extentDataProj () {
      return roundExtent(this.extent)
    },
    extentViewProj () {
      return transformExtent(this.extent, this.resolvedExtentProjection, this.resolvedViewProjection)
    },
    currentExtentDataProj () {
      return transformExtent(this.currentExtentViewProj, this.resolvedViewProjection, this.resolvedExtentProjection)
    },
  },
  watch: {
    rev () {
      if (!this.$layer) return

      if (!isEqual(this.currentExtentViewProj, this.$layer.getExtent())) {
        this.currentExtentViewProj = this.$layer.getExtent()
      }
      if (this.currentMaxResolution !== this.$layer.getMaxResolution()) {
        this.currentMaxResolution = this.$layer.getMaxResolution()
      }
      if (this.currentMinResolution !== this.$layer.getMinResolution()) {
        this.currentMinResolution = this.$layer.getMinResolution()
      }
      if (this.currentMaxZoom !== this.$layer.getMaxZoom()) {
        this.currentMaxZoom = this.$layer.getMaxZoom()
      }
      if (this.currentMinZoom !== this.$layer.getMinZoom()) {
        this.currentMinZoom = this.$layer.getMinZoom()
      }
      if (this.currentOpacity !== this.$layer.getOpacity()) {
        this.currentOpacity = this.$layer.getOpacity()
      }
      if (this.currentVisible !== this.$layer.getVisible()) {
        this.currentVisible = this.$layer.getVisible()
      }
      if (this.currentZIndex !== this.$layer.getZIndex()) {
        this.currentZIndex = this.$layer.getZIndex()
      }
    },
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'className',
      'opacity',
      'currentOpacity',
      'visible',
      'currentVisible',
      'extentViewProj',
      'currentExtentDataProj',
      'zIndex',
      'currentZIndex',
      'minResolution',
      'currentMinResolution',
      'maxResolution',
      'currentMaxResolution',
      'minZoom',
      'currentMinZoom',
      'maxZoom',
      'currentMaxZoom',
    ], [
      'extentViewProj',
      'currentExtentDataProj',
    ]),
  },
  created () {
    this::defineServices()

    this.currentExtentViewProj = this.extentViewProj?.slice()
  },
  methods: {
    /**
     * @return {Promise<void>}
     * @protected
     */
    async beforeInit () {
      await Promise.all([
        this::olCmp.methods.beforeInit(),
        this::waitForMap.methods.beforeInit(),
      ])
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
      throw new Error(`${this.vmName} not implemented method: createLayer`)
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async mount () {
      this.$layersContainer?.addLayer(this)

      return this::olCmp.methods.mount()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async unmount () {
      this.$layersContainer?.removeLayer(this)

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
     * @returns {string|number}
     * @protected
     */
    getIdInternal () {
      return getLayerId(this.$layer)
    },
    /**
     * @param {string|number} id
     * @protected
     */
    setIdInternal (id) {
      if (id === this.getIdInternal()) return

      setLayerId(this.$layer, id)
    },
    /**
     * @return {Promise<module:ol/layer/Base~BaseLayer>}
     */
    resolveLayer: olCmp.methods.resolveOlObject,
    /**
     * @param {boolean} [viewProj=false]
     * @returns {number[]|undefined}
     */
    getExtent (viewProj = false) {
      if (!this.$layer) {
        return viewProj ? this.currentExtentViewProj : this.currentExtentDataProj
      }

      const extent = this.$layer.getExtent()
      if (viewProj) return roundExtent(extent)

      return transformExtent(extent, this.resolvedViewProjection, this.resolvedExtentProjection)
    },
    /**
     * @param {number[]} extent
     * @param {boolean} [viewProj=false]
     */
    setExtent (extent, viewProj = false) {
      assert(extent == null || (isArray(extent) && extent.length === 4), 'Invalid extent')
      extent = viewProj
        ? roundExtent(extent)
        : transformExtent(extent, this.resolvedExtentProjection, this.resolvedViewProjection)

      if (!isEqual(extent, this.currentExtentViewProj)) {
        this.currentExtentViewProj = extent
      }
      if (this.$layer && !isEqual(extent, this.$layer.getExtent())) {
        this.$layer.setExtent(extent)
      }
    },
    /**
     * @returns {number|undefined}
     */
    getMaxResolution () {
      return coalesce(this.$layer?.getMaxResolution(), this.currentMaxResolution)
    },
    /**
     * @param {number} resolution
     */
    setMaxResolution (resolution) {
      resolution = Number(resolution)
      assert(isNumber(resolution), 'Invalid max resolution')

      if (resolution !== this.currentMaxResolution) {
        this.currentMaxResolution = resolution
      }
      if (this.$layer && resolution !== this.$layer.getMaxResolution()) {
        this.$layer.setMaxResolution(resolution)
      }
    },
    /**
     * @returns {number|undefined}
     */
    getMinResolution () {
      return coalesce(this.$layer?.getMinResolution(), this.currentMinResolution)
    },
    /**
     * @param {number} resolution
     */
    setMinResolution (resolution) {
      resolution = Number(resolution)
      assert(isNumber(resolution), 'Invalid min resolution')

      if (resolution !== this.currentMinResolution) {
        this.currentMinResolution = resolution
      }
      if (this.$layer && resolution !== this.$layer.getMinResolution()) {
        this.$layer.getMinResolution(resolution)
      }
    },
    /**
     * @returns {number}
     */
    getMaxZoom () {
      return coalesce(this.$layer?.getMaxZoom(), this.currentMaxZoom)
    },
    /**
     * @param {number} zoom
     */
    setMaxZoom (zoom) {
      zoom = Number(zoom)
      assert(isNumber(zoom), 'Invalid max zoom')

      if (zoom !== this.currentMaxZoom) {
        this.currentMaxZoom = zoom
      }
      if (this.$layer && zoom !== this.$layer.getMaxZoom()) {
        this.$layer.setMaxZoom(zoom)
      }
    },
    /**
     * @returns {number}
     */
    getMinZoom () {
      return coalesce(this.$layer?.getMinZoom(), this.currentMinZoom)
    },
    /**
     * @param {number} zoom
     */
    setMinZoom (zoom) {
      zoom = Number(zoom)
      assert(isNumber(zoom), 'Invalid min zoom')

      if (zoom !== this.currentMinZoom) {
        this.currentMinZoom = zoom
      }
      if (this.$layer && zoom !== this.$layer.getMinZoom()) {
        this.$layer.setMinZoom(zoom)
      }
    },
    /**
     * @returns {number}
     */
    getOpacity () {
      return coalesce(this.$layer?.getOpacity(), this.currentOpacity)
    },
    /**
     * @param {number} opacity
     */
    setOpacity (opacity) {
      opacity = Number(opacity)
      assert(isNumber(opacity), 'Invalid opacity')

      if (opacity !== this.currentOpacity) {
        this.currentOpacity = opacity
      }
      if (this.$layer && opacity !== this.$layer.getOpacity()) {
        this.$layer.setOpacity(opacity)
      }
    },
    /**
     * @returns {boolean}
     */
    getVisible () {
      return coalesce(this.$layer?.getVisible(), this.currentVisible)
    },
    /**
     * @param {boolean} visible
     */
    setVisible (visible) {
      visible = !!visible

      if (visible !== this.currentVisible) {
        this.currentVisible = visible
      }
      if (this.$layer && visible !== this.$layer.getVisible()) {
        this.$layer.setVisible(visible)
      }
    },
    /**
     * @returns {number}
     */
    getZIndex () {
      return coalesce(this.$layer?.getZIndex(), this.currentZIndex)
    },
    /**
     * @param {number} zIndex
     */
    setZIndex (zIndex) {
      zIndex = Number(zIndex)
      assert(isNumber(zIndex), 'Invalid zIndex')

      if (zIndex !== this.currentZIndex) {
        this.currentZIndex = zIndex
      }
      if (this.$layer && zIndex !== this.$layer.getZIndex()) {
        this.$layer.setZIndex(zIndex)
      }
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
     * @param {number} value
     * @protected
     */
    opacityChanged (value) {
      this.setOpacity(value)
    },
    /**
     * @param {number} value
     * @protected
     */
    currentOpacityChanged (value) {
      if (value === this.opacity) return

      this.$emit('update:opacity', value)
    },
    /**
     * @param {boolean} value
     * @protected
     */
    visibleChanged (value) {
      this.setVisible(value)
    },
    /**
     * @param {boolean} value
     * @protected
     */
    currentVisibleChanged (value) {
      if (value === this.visible) return

      this.$emit('update:visible', value)
    },
    /**
     * @param {number[]|undefined} value
     * @protected
     */
    extentViewProjChanged (value) {
      this.setExtent(value, true)
    },
    /**
     * @param {number[]|undefined} value
     * @protected
     */
    currentExtentDataProjChanged (value) {
      if (isEqual(value, this.extentDataProj)) return

      this.$emit('update:extent', value.slice())
    },
    /**
     * @param {number|undefined} value
     * @protected
     */
    zIndexChanged (value) {
      this.setZIndex(value)
    },
    /**
     * @param {number|undefined} value
     * @protected
     */
    currentZIndexChanged (value) {
      if (value === this.zIndex) return

      this.$emit('update:zIndex', value)
    },
    /**
     * @param {number|undefined} value
     * @protected
     */
    minResolutionChanged (value) {
      this.setMinResolution(value)
    },
    /**
     * @param {number|undefined} value
     * @protected
     */
    currentMinResolutionChanged (value) {
      if (value === this.minResolution) return

      this.$emit('update:minResolution', value)
    },
    /**
     * @param {number|undefined} value
     * @protected
     */
    maxResolutionChanged (value) {
      this.setMaxResolution(value)
    },
    /**
     * @param {number|undefined} value
     * @protected
     */
    currentMaxResolutionChanged (value) {
      if (value === this.maxResolution) return

      this.$emit('update:maxResolution', value)
    },
    /**
     * @param {number|undefined} value
     * @protected
     */
    minZoomChanged (value) {
      this.setMinZoom(value)
    },
    /**
     * @param {number|undefined} value
     * @protected
     */
    currentMinZoomChanged (value) {
      if (value === this.minZoom) return

      this.$emit('update:minZoom', value)
    },
    /**
     * @param {number|undefined} value
     * @protected
     */
    maxZoomChanged (value) {
      this.setMaxZoom(value)
    },
    /**
     * @param {number|undefined} value
     * @protected
     */
    currentMaxZoomChanged (value) {
      if (value === this.maxZoom) return

      this.$emit('update:maxZoom', value)
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
  const setterKey = addPrefix('set')
  const propChanges = obsFromOlChangeEvent(this.$layer, [
    'opacity',
    'visible',
    'zIndex',
    'minResolution',
    'maxResolution',
    'minZoom',
    'maxZoom',
    'extent',
  ], true, evt => ({
    ...evt,
    setter: val => {
      const args = [val]
      if (evt.prop === 'extent') {
        args.push(true)
      }
      this[setterKey(evt.prop)](...args)
    },
  }))
  this.subscribeTo(propChanges, ({ setter, value }) => setter(value))
}
