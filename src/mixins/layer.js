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
  updateLayer () {
    this.layer.changed()
  },
  /**
   * @return {ol.layer.Layer}
   * @protected
   */
  createLayer () {
    throw new Error('Not implemented')
  },
  /**
   * @return {ol.layer.Base}
   */
  getLayer () {
    return this.layer
  },
  /**
   * @return {ol.Map}
   */
  getMap () {
    return this.map
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
  props,
  methods,
  watch,
  beforeCreate () {
    try {
      this.map = this.$parent.getMap()
    } catch (err) {
      throw new Error('Layer component used not in map component.')
    }
  },
  create () {
    /**
     * @type {ol.layer.Layer}
     * @protected
     */
    this.layer = this.createLayer()
  },
  mounted () {
    this.map.addLayer(this.layer)
  },
  beforeDestroy () {
    this.map && this.layer && this.map.removeLayer(this.layer)

    this.layer = this.map = undefined
  }
}
