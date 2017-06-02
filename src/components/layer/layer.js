import Vue from 'vue'
import uuid from 'uuid/v4'
import { VM_PROP } from '../../consts'
import mergeDescriptors from '../../utils/multi-merge-descriptors'
import rxSubs from '../rx-subs'
import stubVNode from '../stub-vnode'
import services from '../services'
import { assertHasLayer, assertHasMap } from '../../utils/assert'

const props = {
  extent: {
    type: Array,
    validator: value => value.length === 4
  },
  id: {
    type: [String, Number],
    default: () => uuid()
  },
  minResolution: Number,
  maxResolution: Number,
  opacity: Number,
  overlay: Boolean,
  visible: {
    type: Boolean,
    default: true
  },
  zIndex: Number
}

const methods = {
  /**
   * @param {number[]} pixel
   * @return {boolean}
   */
  isAtPixel (pixel) {
    assertHasMap(this)

    return this.map.forEachLayerAtPixel(pixel, layer => layer === this)
  },
  /**
   * @return {ol.layer.Layer|undefined}
   */
  getLayer () {
    return this._layer
  },
  /**
   * Updates layer state
   * @return {void}
   */
  refresh () {
    assertHasLayer(this)
    this.layer.changed()
  },
  /**
   * @param {ol.Map|Vue|undefined} map
   */
  setMap (map) {
    assertHasLayer(this)

    map = map instanceof Vue ? map.map : map
    this.layer.setMap(map)
  },
  /**
   * @param {ol.source.Source|Vue|undefined} source
   * @return {void}
   */
  setSource (source) {
    assertHasLayer(this.layer)

    source = source instanceof Vue ? source.source : source
    this.layer.setSource(source)
  },
  // protected & private
  /**
   * @return {ol.layer.Layer}
   * @protected
   * @abstract
   */
  createLayer () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {void}
   * @protected
   */
  initialize () {
    /**
     * @type {ol.layer.Layer}
     * @protected
     */
    this._layer = this.createLayer()
    this._layer.setProperties({
      id: this.id,
      [VM_PROP]: this
    })
    this::defineAccessors()
  },
  /**
   * @returns {Object}
   * @protected
   */
  getServices () {
    return mergeDescriptors(this::services.methods.getServices(), {
      layer: this
    })
  },
  /**
   * @return {void}
   * @protected
   */
  mount () {
    if (this.overlay) {
      this.setMap(this.$parent)
    } else {
      this.$parent.addLayer(this)
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
    } else {
      this.$parent.removeLayer(this)
    }
  },
  /**
   * @return {void}
   */
  subscribeAll () {
  }
}

const watch = {
  id (value) {
    assertHasLayer(this)
    return this.layer.set('id', value)
  },
  maxResolution (value) {
    assertHasLayer(this)
    this.layer.setMaxResolution(value)
  },
  minResolution (value) {
    assertHasLayer(this)
    this.layer.setMinResolution(value)
  },
  opacity (value) {
    assertHasLayer(this)
    this.layer.setOpacity(value)
  },
  visible (value) {
    assertHasLayer(this)
    this.layer.setVisible(value)
  },
  zIndex (value) {
    assertHasLayer(this)
    this.layer.setZIndex(value)
  }
}

export default {
  mixins: [rxSubs, stubVNode, services],
  props,
  methods,
  watch,
  stubVNode: {
    attrs () {
      return {
        id: [this.$options.name, this.id].join('-')
      }
    }
  },
  created () {
    this.initialize()
  },
  mounted () {
    this.mount()
  },
  destroyed () {
    this.unmount()
    this._layer = undefined
  }
}

/**
 * @return {void}
 * @private
 */
function defineAccessors () {
  Object.defineProperties(this, {
    layer: {
      enumerable: true,
      get: this.getLayer
    },
    map: {
      enumerable: true,
      get: () => this.services && this.services.map
    }
  })
}
