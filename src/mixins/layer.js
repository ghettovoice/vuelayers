import exposeContext from 'vuelayers/src/mixins/expose-context'
import { MAP_PROJECTION } from 'vuelayers/src/ol'

const props = {
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
    default: MAP_PROJECTION
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
  context () {
    return {
      ...this.$parent.context(),
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
  render: h => h('slot'),
  created () {
    /**
     * @type {ol.layer.Layer}
     * @protected
     */
    this.layer = this.createLayer()
  },
  mounted () {
    this.context().map.addLayer(this.layer)
  },
  beforeDestroy () {
    this.context().map.removeLayer(this.layer)

    this.layer = undefined
  }
}
