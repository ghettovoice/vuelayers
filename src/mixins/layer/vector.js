import ol from 'openlayers'
import layer from 'vuelayers/src/mixins/layer/layer'

const props = {
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
  getStyleTarget () {
    return {
      setStyle: this::setStyle,
      getStyle: this::getStyle
    }
  },
  expose () {
    return {
      ...this::layerExpose(),
      styleTarget: this.getStyleTarget()
    }
  }
}

export default {
  mixins: [ layer ],
  props,
  methods,
  render (h) {
    return h('i', {
      style: {
        display: 'none !important'
      }
    }, this.$slots.default)
  }
}

function setStyle (style) {
  this.styles = style

  if (this.layer) {
    this.layer.setStyle((feature, resolution) => {
      // todo implement conditions on vl-style-container
      return this.styles
    })
    this.refresh()
  }
}

function getStyle () {
  return this.styles || []
}
