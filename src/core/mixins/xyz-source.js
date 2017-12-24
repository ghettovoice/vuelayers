import { isFunction } from 'lodash/fp'
import { createTileUrlFunction } from 'ol-tilecache'
import XYZSource from 'ol/source/xyz'
import * as extentHelper from '../ol-ext/extent'
import tileSource from './tile-source'

const props = {}

const computed = {
  urlFunc () {
    // custom url function provided
    if (isFunction(this.url)) {
      return this.url
    }
    // or use url function from ol-tilecache
    return createTileUrlFunction(
      this.urlTmpl,
      this._tileGrid,
      extentHelper.fromProjection(this.projection)
    )
  },
}

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
      tileUrlFunction: this.urlFunc,
      wrapX: this.wrapX,
    })
  },
}

const watch = {
}

export default {
  mixins: [tileSource],
  props,
  computed,
  methods,
  watch,
}
