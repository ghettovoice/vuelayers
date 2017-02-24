import emptyNode from 'vuelayers/src/mixins/empty-node'
import mapComponent from 'vuelayers/src/mixins/map-component'
import { MAP_PROJECTION } from 'vuelayers/src/ol'

const props = {
  attributions: Array,
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
  }
}

const methods = {
  updateLayer () {
    this.layer.changed()
  },
  /**
   * @protected
   */
  createLayer () {
    throw new Error('Should be overriden')
  },
  getLayer () {
    return this.layer
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
  mixins: [ emptyNode, mapComponent ],
  props,
  methods,
  watch,
  create () {
    /**
     * @type {ol.layer.Layer}
     * @protected
     */
    this.layer = undefined
    this.createLayer()
  },
  mounted () {
    this.map.addLayer(this.layer)
  },
  beforeDestroy () {
    if (this.layer) {
      this.map.removeLayer(this.layer)
      this.layer = undefined
    }

    this.map = undefined
  }
}
