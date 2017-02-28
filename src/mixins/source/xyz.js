import ol from 'openlayers'
import tileSource from 'vuelayers/src/mixins/source/tile'

const methods = {
  createSource () {
    return new ol.source.XYZ({
      attributions: this.attributions,
      tileUrlFunction: this.createTileUrlFunction(),
      crossOrigin: this.crossOrigin,
      projection: this.projection,
      tileGrid: this.createTileGrid(),
      tilePixelRatio: this.tilePixelRatio,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      wrapX: this.wrapX,
      opaque: this.opaque,
      cacheSize: this.cacheSize
    })
  }
}

export default {
  mixins: [ tileSource ],
  methods
}
