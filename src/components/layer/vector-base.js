import ol from 'openlayers'
import layer from 'vl-components/layer/layer'

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
  }
}

export default {
  mixins: [ layer ],
  props,
  methods,
  provide () {
    return {
      layer: () => this.layer,
      setStyle: this::setStyle,
      getStyle: this::getStyle
    }
  },
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
    if (this.styles && this.styles.length) {
      this.layer.setStyle((feature, resolution) => {
        // todo implement conditions on vl-style-container
        return this.styles
      })
    } else {
      this.layer.setStyle(undefined)
    }
    this.refresh()
  }
}

function getStyle () {
  return this.styles || []
}
