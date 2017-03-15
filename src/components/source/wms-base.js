/**
 * Base mixin for WMS sources
 */
import ol from 'vl-ol'
import tileSource from 'vl-components/source/tile-base'

const props = {
  layers: {
    type: String,
    required: true
  },
  styles: String, // WMS Request styles
  extParams: Object, // Additional WMS Request params
  gutter: Number,
  hidpi: Boolean,
  serverType: String
}

const computed = {
  currentLayers () {
    return this.layers
  },
  currentStyles () {
    return this.styles
  },
  currentServerType () {
    return this.serverType
  },
  currentExtParams () {
    return this.extParams
  }
}

const methods = {
  createSource () {
    return new ol.source.TileWMS({
      attributions: this.currentAttributions,
      cacheSize: this.cacheSize,
      params: {
        ...this.currentExtParams,
        LAYERS: this.currentLayers,
        STYLES: this.currentStyles
      },
      crossOrigin: this.crossOrigin,
      gutter: this.gutter,
      hidpi: this.hidpi,
      logo: this.logo,
      tileGrid: this.tileGrid,
      projection: this.currentProjection,
      reprojectionErrorThreshold: this.reprojectionErrorThreshold,
      serverType: this.currentServerType,
      wrapX: this.wrapX,
      url: this.replaceUrlTokens()
    })
  }
}

export default {
  mixins: [ tileSource ],
  props,
  computed,
  methods
}
