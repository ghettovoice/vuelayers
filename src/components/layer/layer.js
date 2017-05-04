import uuid from 'uuid/v4'
import Observable from '../../rx-ext'
import rxSubs from '../../mixins/rx-subs'
import stubVNode from '../../mixins/stub-vnode'
import { coordinateHelper } from '../../ol-ext'

const { toLonLat } = coordinateHelper

const props = {
  id: {
    type: [ String, Number ],
    default: () => uuid()
  },
  opacity: {
    type: Number,
    default: 1
  },
  minResolution: Number,
  maxResolution: Number,
  visible: {
    type: Boolean,
    default: true
  },
  extent: {
    type: Array,
    validator: value => Array.isArray(value) && value.length === 4
  },
  zIndex: {
    type: Number,
    default: 0
  },
  overlay: {
    type: Boolean,
    default: false
  }
}

const computed = {
  currentId () {
    return this.id
  },
  currentMinResolution () {
    return this.minResolution
  },
  currentMaxResolution () {
    return this.maxResolution
  },
  currentExtent () {
    return this.extent
  },
  currentOpacity () {
    return this.opacity
  }
}

const methods = {
  /**
   * Updates layer state
   */
  refresh () {
    this.layer && this.layer.changed()
  },
  initialize () {
    /**
     * @type {Layer}
     * @protected
     */
    this.layer = this.createLayer()
    this.layer.setProperties({
      id: this.currentId,
      vm: this
    })
  },
  /**
   * @return {Layer}
   * @protected
   */
  createLayer () {
    throw new Error('Not implemented method')
  },
  /**
   * @protected
   */
  mountLayer () {
    if (!this.map) {
      throw new Error("Invalid usage of layer component, should have map component among it's ancestors")
    }

    if (this.overlay) {
      this.layer.setMap(this.map)
    } else {
      this.map.addLayer(this.layer)
    }
    this.subscribeAll()
  },
  /**
   * @protected
   */
  unmountLayer () {
    this.unsubscribeAll()
    if (this.map) {
      if (this.overlay) {
        this.layer.setMap(undefined)
      } else {
        this.map.removeLayer(this.layer)
      }
    }
  },
  subscribeAll () {
    this::subscribeToMapEvents()
  },
  isAtPixel (pixel) {
    return this.map.forEachLayerAtPixel(pixel, layer => layer === this.layer)
  }
}

const watch = {
  currentId (value) {
    return this.layer.set('id', value)
  },
  currentMaxResolution (value) {
    this.layer.setMaxResolution(value)
  },
  currentMinResolution (value) {
    this.layer.setMinResolution(value)
  },
  currentOpacity (value) {
    this.layer.setOpacity(value)
  },
  visible (value) {
    this.layer.setVisible(value)
  },
  zIndex (value) {
    this.layer.setZIndex(value)
  }
}

export default {
  mixins: [ rxSubs, stubVNode ],
  inject: [ 'map', 'view' ],
  props,
  computed,
  methods,
  watch,
  stubVNode: {
    attrs () {
      return {
        id: [ this.$options.name, this.currentId ].join('-')
      }
    }
  },
  provide () {
    return Object.defineProperties(Object.create(null), {
      layer: {
        enumerable: true,
        get: () => this.layer
      }
    })
  },
  created () {
    this.initialize()
  },
  mounted () {
    this.$nextTick(this.mountLayer)
  },
  destroyed () {
    this.$nextTick(() => {
      this.unmountLayer()
      this.layer = undefined
    })
  }
}

function subscribeToMapEvents () {
  const pointerEvents = Observable.fromOlEvent(
    this.map,
    [ 'click', 'dblclick', 'singleclick' ],
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
