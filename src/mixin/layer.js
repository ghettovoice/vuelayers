import uuid from 'uuid/v4'
import Vue from 'vue'
import { hasLayer, hasMap } from '../util/assert'
import { isEqual } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import { observableFromOlEvent } from '../rx-ext'
import cmp from './ol-virt-cmp'
import sourceContainer from './source-container'
import useMapCmp from './use-map-cmp'

const props = {
  id: {
    type: [String, Number],
    default: () => uuid(),
  },
  /**
   * The bounding extent for layer rendering defined in the map view projection.
   * The layer will not be rendered outside of this extent.
   * @default undefined
   * @type {Extent|number[]|undefined}
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
}

const methods = {
  /**
   * @return {Promise<Layer>}
   * @protected
   */
  async createOlObject () {
    let layer = await this.createLayer()
    layer.set('id', this.id)

    return layer
  },
  /**
   * @return {Layer|Promise<Layer>}
   * @protected
   * @abstract
   */
  createLayer () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {Promise<Vue<Layer>>}
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
   * @param {number[]} pixel
   * @return {boolean}
   */
  isAtPixel (pixel) {
    hasMap(this)

    return this.$map.forEachLayerAtPixel(pixel, l => l === this.$layer)
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
   *     setSource: function(Source): void,
   *     getSource: function(): Source
   *   }|undefined}
   * @protected
   */
  getSourceTarget () {
    return this.$layer
  },
  /**
   * @return {void}
   * @protected
   */
  mount () {
    if (this.overlay && this.$map) {
      this.setMap(this.$map)
    } else if (this.$layersContainer) {
      this.$layersContainer.addLayer(this)
    }

    this.subscribeAll()
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    this.unsubscribeAll()

    if (this.overlay) {
      this.setMap(undefined)
    } else if (this.$layersContainer) {
      this.$layersContainer.removeLayer(this)
    }
  },
  /**
   * Updates layer state
   * @return {Promise}
   */
  refresh () {
    return this::cmp.methods.refresh()
  },
  /**
   * @param {Map|Vue|undefined} map
   */
  setMap (map) {
    hasLayer(this)

    map = map instanceof Vue ? map.$map : map
    this.$layer.setMap(map)
  },
  subscribeAll () {
    this::subscribeToLayerEvents()
  },
}

const watch = {
  id (value) {
    if (this.$layer && value !== this.$layer.get('id')) {
      this.$layer.set('id', value)
    }
  },
  maxResolution (value) {
    if (this.$layer && value !== this.$layer.getMaxResolution()) {
      this.$layer.setMaxResolution(value)
    }
  },
  minResolution (value) {
    if (this.$layer && value !== this.$layer.getMinResolution()) {
      this.$layer.setMinResolution(value)
    }
  },
  opacity (value) {
    if (this.$layer && value !== this.$layer.getOpacity()) {
      this.$layer.setOpacity(value)
    }
  },
  visible (value) {
    if (this.$layer && value !== this.$layer.getVisible()) {
      this.$layer.setVisible(value)
    }
  },
  zIndex (value) {
    if (this.$layer && value !== this.$layer.getZIndex()) {
      this.$layer.setZIndex(value)
    }
  },
  extent (value) {
    if (this.$layer && !isEqual(value, this.$layer.getExtent())) {
      this.$layer.setExtent(value)
    }
  },
}

export default {
  mixins: [cmp, useMapCmp, sourceContainer],
  props,
  methods,
  watch,
  stubVNode: {
    attrs () {
      return {
        id: [this.$options.name, this.id].join('-'),
        class: this.$options.name,
      }
    },
  },
  created () {
    Object.defineProperties(this, {
      /**
       * @type {Layer|undefined}
       */
      $layer: {
        enumerable: true,
        get: () => this.$olObject,
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
  },
}

function subscribeToLayerEvents () {
  hasLayer(this)

  const events = observableFromOlEvent(this.$layer, [
    'postcompose',
    'precompose',
    'render',
  ])

  this.subscribeTo(events, evt => this.$emit(evt.type, evt))
}
