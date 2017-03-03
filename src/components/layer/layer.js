import uuid from 'node-uuid'
import rxSubs from 'vl-mixins/rx-subs'

const props = {
  id: {
    type: [ String, Number ],
    default: () => uuid.v4()
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
  }
}

const methods = {
  /**
   * Updates layer state
   */
  refresh () {
    this.layer.changed()

    const source = this.layer.getSource()
    source && source.changed()
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
    this.map() && this.map().addLayer(this.layer)
  },
  /**
   * @protected
   */
  unmountLayer () {
    console.log(this.map())
    this.map() && this.map().removeLayer(this.layer)
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
    this.mountLayer()
  },
  destroyed () {
    this.unmountLayer()
    this.layer = undefined
  }
}
