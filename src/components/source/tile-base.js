import ol from 'openlayers'
import { createTileUrlFunction } from 'ol3-tilecache'
import { pick, replaceTokens } from 'vl-utils/func'
import source from 'vl-components/source/source'
import { consts as olConsts } from 'vl-ol'

const props = {
  url: {
    type: String,
    required: true
  },
  tileSize: {
    type: Array,
    default: () => [ olConsts.TILE_SIZE, olConsts.TILE_SIZE ],
    validator: value => value.length === 2
  },
  tilePixelRatio: {
    type: Number,
    default: olConsts.PIXEL_RATIO
  },
  crossOrigin: {
    type: String,
    default: 'anonymous'
  },
  cacheSize: {
    type: Number,
    default: olConsts.CACHE_SIZE
  },
  opaque: Boolean,
  minZoom: {
    type: Number,
    default: olConsts.MIN_ZOOM
  },
  maxZoom: {
    type: Number,
    default: olConsts.MAX_ZOOM
  }
}

const computed = {
  urlTokens () {
    return []
  }
}

const methods = {
  /**
   * @return {ol.tilegrid.TileGrid}
   * @protected
   */
  createTileGrid () {
    return ol.tilegrid.createXYZ({
      extent: ol.proj.get(this.projection).getExtent(),
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      tileSize: this.tileSize
    })
  },
  /**
   * @return {ol.TileUrlFunction}
   * @protected
   */
  createTileUrlFunction () {
    return createTileUrlFunction(this.replaceUrlTokens())
  },
  /**
   * @return {string}
   * @protected
   */
  replaceUrlTokens () {
    return replaceTokens(this.url, pick(this.urlTokens, this))
  }
}

export default {
  mixins: [ source ],
  props,
  computed,
  methods
}
