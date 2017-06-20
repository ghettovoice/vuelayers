import Vue from 'vue'
import uuid from 'uuid/v4'
import mergeDescriptors from '../../utils/multi-merge-descriptors'
import cmp from '../ol-virt-cmp'
import * as assert from '../../utils/assert'

const props = {
  id: {
    type: [String, Number],
    default: () => uuid()
  },
  extent: {
    type: Array,
    validator: value => value.length === 4
  },
  minResolution: Number,
  maxResolution: Number,
  opacity: {
    type: Number,
    default: 1
  },
  overlay: Boolean,
  visible: {
    type: Boolean,
    default: true
  },
  zIndex: Number
}

const methods = {
  /**
   * @return {ol.layer.Layer|Promise<ol.layer.Layer>}
   * @protected
   */
  createOlObject () {
    let layer = this.createLayer()
    layer.set('id', this.id)

    return layer
  },
  /**
   * @return {ol.layer.Layer|Promise<ol.layer.Layer>}
   * @protected
   * @abstract
   */
  createLayer () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {Promise}
   * @protected
   */
  init () {
    return this::cmp.methods.init()
  },
  /**
   * @return {void}
   * @protected
   */
  deinit () {
    this::cmp.methods.deinit()
  },
  /**
   * @return {void}
   * @protected
   */
  defineAccessors () {
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
  },
  /**
   * @param {number[]} pixel
   * @return {boolean}
   */
  isAtPixel (pixel) {
    assert.hasMap(this)

    return this.map.forEachLayerAtPixel(pixel, l => l === this.layer)
  },
  /**
   * @return {ol.layer.Layer|undefined}
   */
  getLayer () {
    return this.olObject
  },
  /**
   * @returns {Object}
   * @protected
   */
  getServices () {
    return mergeDescriptors(this::cmp.methods.getServices(), {
      layer: this
    })
  },
  /**
   * @return {ol.source.Source|undefined}
   */
  getSource () {
    return this.layer && this.layer.getSource()
  },
  /**
   * @return {Vue|undefined}
   */
  getSourceCmp () {
    return this.$children.slice().reverse().find(c => c.hasOwnProperty('source'))
  },
  /**
   * @param {ol.source.Source|Vue|undefined} source
   * @return {void}
   */
  setSource (source) {
    assert.hasLayer(this)

    source = source instanceof Vue ? source.source : source
    if (source !== this.layer.getSource()) {
      this.layer.setSource(source)
    }
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
   * Updates layer state
   * @return {void}
   */
  refresh () {
    assert.hasLayer(this)
    this.layer.changed()
  },
  /**
   * @param {ol.Map|Vue|undefined} map
   */
  setMap (map) {
    assert.hasLayer(this)

    map = map instanceof Vue ? map.map : map
    this.layer.setMap(map)
  }
}

const watch = {
  id (value) {
    this.layer && this.layer.set('id', value)
  },
  maxResolution (value) {
    this.layer && this.layer.setMaxResolution(value)
  },
  minResolution (value) {
    this.layer && this.layer.setMinResolution(value)
  },
  opacity (value) {
    this.layer && this.layer.setOpacity(value)
  },
  visible (value) {
    this.layer && this.layer.setVisible(value)
  },
  zIndex (value) {
    this.layer && this.layer.setZIndex(value)
  }
}

export default {
  mixins: [cmp],
  props,
  methods,
  watch,
  stubVNode: {
    attrs () {
      return {
        id: [this.$options.name, this.id].join('-')
      }
    }
  }
}
