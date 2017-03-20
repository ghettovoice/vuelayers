import ol from 'vl-ol'
import layer from 'vl-components/layer/layer'

const props = {
  preload: Number
}

const methods = {
  createLayer () {
    return new ol.layer.Tile({
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
