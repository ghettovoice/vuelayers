import uuid from 'uuid/v4'
import rxSubs from 'vl-mixins/rx-subs'
import { warn } from 'vl-utils/debug'

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
    validator: value => value.length === 4
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

const methods = {
  /**
   * Updates layer state
   */
  refresh () {
    this.layer && this.layer.changed()
  },
  initialize () {
    /**
     * @type {ol.layer.Layer}
     * @protected
     */
    this.layer = this.createLayer()
    this.layer.$vm = this
    this.layer.set('id', this.id)
  },
  /**
   * @return {ol.layer.Layer}
   * @protected
   */
  createLayer () {
    throw new Error('Not implemented method')
  },
  /**
   * @protected
   */
  mountLayer () {
    if (this.map()) {
      if (this.overlay) {
        this.layer.setMap(this.map())
      } else {
        this.map().addLayer(this.layer)
      }
      this.subscribeAll()
    } else if (process.env.NODE_ENV !== 'production') {
      warn("Invalid usage of map component, should have layer component among it's ancestors")
    }
  },
  /**
   * @protected
   */
  unmountLayer () {
    this.unsubscribeAll()
    if (this.map()) {
      if (this.overlay) {
        this.layer.setMap(undefined)
      } else {
        this.map().removeLayer(this.layer)
      }
    }
  }
}

const watch = {
  maxResolution (value) {
    this.layer.setMaxResolution(value)
  },
  minResolution (value) {
    this.layer.setMinResolution(value)
  },
  opacity (value) {
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
  mixins: [ rxSubs ],
  inject: [ 'map' ],
  props,
  methods,
  watch,
  provide () {
    return {
      layer: () => this.layer
    }
  },
  render (h) {
    return h('i', {
      style: {
        display: 'none !important'
      }
    }, this.$slots.default)
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
