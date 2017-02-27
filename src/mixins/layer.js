import uuid from 'node-uuid'
import exposeContext from 'vuelayers/src/mixins/expose-context'
import { consts as olConsts } from 'vuelayers/src/ol'

const props = {
  id: {
    type: String,
    default: uuid.v4()
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
  projection: {
    type: String,
    default: olConsts.MAP_PROJECTION
  },
  extent: {
    type: Array,
    validator: value => value.length === 4
  },
  zIndex: Number
}

const methods = {
  /**
   * Updates layer state
   */
  refresh () {
    this.layer.changed()
  },
  /**
   * @return {ol.layer.Layer}
   * @protected
   */
  createLayer () {
    throw new Error('Not implemented')
  },
  expose () {
    return {
      ...this.$parent.expose(),
      layer: this.layer
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
  }
}

export default {
  name: 'vl-layer',
  mixins: [ exposeContext ],
  props,
  methods,
  watch,
  render (h) {
    return h('span', {
      style: {
        display: 'none'
      }
    }, this.$slots.default)
  },
  created () {
    /**
     * @type {ol.layer.Layer}
     * @protected
     */
    this.layer = this.createLayer()
  },
  mounted () {
    this.context.map.addLayer(this.layer)
  },
  beforeDestroy () {
    this.context.map.removeLayer(this.layer)
  },
  destroyed () {
    this.layer = undefined
  }
}
