import ol from 'openlayers'
import layer from 'vuelayers/src/mixins/layer/layer'
import { style as olStyle } from 'vuelayers/src/ol'

const props = {
  /**
   * Style hash, e.i. hash of styles
   */
  style: Object,
  updateWhileAnimating: {
    type: Boolean,
    default: false
  },
  updateWhileInteracting: {
    type: Boolean,
    default: false
  }
  // todo implement options
  // renderOrder: Function,
  // renderBuffer: Number
}

const layerExpose = layer.methods.expose

const methods = {
  createStyleFunc () {
    return olStyle.createStyleFunc(this.style)
  },
  createLayer () {
    return new ol.layer.Vector({
      id: this.id,
      minResolution: this.minResolution,
      maxResolution: this.maxResolution,
      opacity: this.opacity,
      visible: this.visible,
      preload: this.preload,
      projection: this.projection,
      extent: this.extent,
      zIndex: this.zIndex,
      updateWhileAnimating: this.updateWhileAnimating,
      updateWhileInteracting: this.updateWhileInteracting
    })
  },
  expose () {
    return {
      ...this::layerExpose(),
      styleTarget: this.layer
    }
  }
}

const watch = {
  style: {
    deep: true,
    handler () {
      this.layer.setStyle(this.createStyleFunc())
    }
  }
}

export default {
  mixins: [ layer ],
  props,
  methods,
  watch,
  render (h) {
    return h('i', {
      style: {
        display: 'none'
      }
    }, this.$slots.default)
  }
}
