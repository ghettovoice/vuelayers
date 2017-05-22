import uuid from 'uuid/v4'
import { SERVICE_CONTAINER_KEY } from '../../consts'
import Observable from '../../rx-ext'
import rxSubs from '../rx-subs'
import stubVNode from '../stub-vnode'
import { coordHelper } from '../../ol-ext'
import { assertHasLayer, assertHasMap, assertHasView } from '../../utils/assert'

const { toLonLat } = coordHelper

const props = {
  extent: {
    type: Array,
    validator: value => Array.isArray(value) && value.length === 4
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
   * @return {ol.layer.Layer|undefined}
   */
  getLayer () {
    return this._layer
  },
  /**
   * @return {ol.source.Source}
   */
  getSource () {
    assertHasLayer(this)
    return this.layer.getSource()
  },
  /**
   * @param {number[]} pixel
   * @return {boolean}
   */
  isAtPixel (pixel) {
    assertHasMap(this)
    assertHasLayer(this)

    return this.map.forEachLayerAtPixel(pixel, layer => layer === this.layer)
  },
  /**
   * Updates layer state
   * @return {void}
   */
  refresh () {
    assertHasLayer(this)
    this.layer.changed()
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
      vm: this
    })
    this::defineAccessors()
  },
  /**
   * @return {void}
   * @protected
   */
  mount () {
    assertHasMap(this)
    assertHasLayer(this)

    if (this.overlay) {
      this.layer.setMap(this.map)
    } else {
      this.map.addLayer(this.layer)
    }

    this.subscribeAll()
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    assertHasMap(this)
    assertHasLayer(this)

    this.unsubscribeAll()

    if (this.overlay) {
      this.layer.setMap(undefined)
    } else {
      this.map.removeLayer(this.layer)
    }
  },
  /**
   * @return {void}
   */
  subscribeAll () {
    this::subscribeToMapEvents()
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
  mixins: [rxSubs, stubVNode],
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
  inject: {
    serviceContainer: SERVICE_CONTAINER_KEY
  },
  provide () {
    const vm = this

    return {
      [SERVICE_CONTAINER_KEY]: {
        get layer () { return vm.layer },
        get map () { return vm.map },
        get view () { return vm.view }
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
function subscribeToMapEvents () {
  assertHasMap(this)
  assertHasView(this)

  const pointerEvents = Observable.fromOlEvent(
    this.map,
    ['click', 'dblclick', 'singleclick'],
    ({ type, pixel, coordinate }) => ({ type, pixel, coordinate })
  ).map(evt => ({
    ...evt,
    coordinate: toLonLat(evt.coordinate, this.view.getProjection())
  }))

  this.subscribeTo(pointerEvents, evt => {
    if (this.isAtPixel(evt.pixel)) {
      this.$emit(evt.type, evt)
    }
  })
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
      get: () => this.serviceContainer.map
    },
    view: {
      enumerable: true,
      get: () => this.serviceContainer.view
    }
  })
}
