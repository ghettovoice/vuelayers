import ol from 'vl-ol'
import tileSource from 'vl-components/source/tile-base'

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
