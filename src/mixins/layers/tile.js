import ol from 'openlayers'
import layer from 'vuelayers/src/mixins/layers/layer'

const props = {
  preload: Number
}

const methods = {
  createLayer () {
    return new ol.layer.Tile({
      id: this.id,
      minResolution: this.minResolution,
      maxResolution: this.maxResolution,
      opacity: this.opacity,
      visible: this.visible,
      preload: this.preload,
      projection: this.projection,
      extent: this.extent,
      zIndex: this.zIndex
    })
  }
}

export default {
  name: 'vl-tile-layer',
  mixins: [ layer ],
  props,
  methods
}
