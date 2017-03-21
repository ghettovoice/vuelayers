import VectorLayer from 'ol/layer/vector'
import layer from 'vl-components/layer/layer'
import styleTarget from 'vl-components/style/target'

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
    return new VectorLayer({
      id: this.currentId,
      minResolution: this.currentMinResolution,
      maxResolution: this.currentMaxResolution,
      opacity: this.currentOpacity,
      visible: this.visible,
      preload: this.preload,
      extent: this.currentExtent,
      zIndex: this.zIndex,
      updateWhileAnimating: this.updateWhileAnimating,
      updateWhileInteracting: this.updateWhileInteracting
    })
  },
  styleTarget () {
    return this.layer
  }
}

const { provide: layerProvide } = layer
const { provide: styleTargetProvide } = styleTarget

export default {
  mixins: [ layer, styleTarget ],
  props,
  methods,
  provide () {
    return Object.assign(this::layerProvide(), this::styleTargetProvide())
  }
}
