import TileLayer from 'ol/layer/tile'
import layer from 'vl-components/layer/layer'

const props = {
  preload: Number
}

const methods = {
  createLayer () {
    return new TileLayer({
      id: this.currentId,
      minResolution: this.currentMinResolution,
      maxResolution: this.currentMaxResolution,
      opacity: this.currentOpacity,
      visible: this.visible,
      preload: this.preload,
      extent: this.currentExtent,
      zIndex: this.zIndex
    })
  }
}

export default {
  mixins: [ layer ],
  props,
  methods
}
