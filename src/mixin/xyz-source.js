import XYZSource from 'ol/source/xyz'
import tileSource from './tile-source'

const methods = {
  /**
   * @return {ol.source.XYZ}
   * @protected
   */
  createSource () {
    return new XYZSource({
      attributions: this.attributions,
      cacheSize: this.cacheSize,
      crossOrigin: this.crossOrigin,
      maxZoom: this.maxZoom,
      minZoom: this.minZoom,
      opaque: this.opaque,
      projection: this.projection,
      reprojectionErrorThreshold: this.reprojectionErrorThreshold,
      tileGrid: this._tileGrid,
      tilePixelRatio: this.tilePixelRatio,
      tileUrlFunction: this.createUrlFunc(),
      tileLoadFunction: this.tileLoadFunction,
      wrapX: this.wrapX,
      transition: this.transition,
    })
  },
}

const watch = {
}

export default {
  mixins: [tileSource],
  methods,
  watch,
}
