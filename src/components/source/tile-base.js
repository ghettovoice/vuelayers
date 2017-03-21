import ol, { consts as olConsts } from 'vl-ol'
import { createTileUrlFunction } from 'ol-tilecache'
import { pick, replaceTokens } from 'vl-utils/func'
import source from 'vl-components/source/source'

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
  },
  reprojectionErrorThreshold: {
    type: Number,
    default: 0.5
  }
}

const computed = {
  currentUrl () {
    return this.url
  },
  currentTileSize () {
    return this.tileSize
  },
  currentTilePixelRatio () {
    return this.tilePixelRatio
  },
  currentMinZoom () {
    return this.minZoom
  },
  currentMaxZoom () {
    return this.maxZoom
  },
  urlTokens () {
    return []
  }
}

const { initialize: sourceInitialize } = source.methods

const methods = {
  initialize () {
    // prepare tile grid and tile grid extent to use it in source / url function /... creation
    this.createTileGrid()
    this::sourceInitialize()
  },
  /**
   * @return {ol.tilegrid.TileGrid}
   * @protected
   */
  createTileGrid () {
    /**
     * @type {ol.Extent}
     * @protected
     */
    this.tileGridExtent = ol.proj.get(this.currentProjection).getExtent()
    /**
     * @type {ol.tileGrid.TileGrid}
     * @protected
     */
    this.tileGrid = ol.tilegrid.createXYZ({
      extent: this.tileGridExtent,
      minZoom: this.currentMinZoom,
      maxZoom: this.currentMaxZoom,
      tileSize: this.currentTileSize
    })

    return this.tileGrid
  },
  /**
   * @return {ol.TileUrlFunction}
   * @protected
   */
  createTileUrlFunction () {
    return createTileUrlFunction(this.replaceUrlTokens(), this.tileGrid, this.tileGridExtent)
  },
  /**
   * @return {string}
   * @protected
   */
  replaceUrlTokens () {
    return replaceTokens(this.currentUrl, pick(this.urlTokens, this))
  }
}

const watch = {
  currentUrl () {
    this.source.setTileUrlFunction(this.createTileUrlFunction())
  },
  currentTileSize () {
    this.source.setTileUrlFunction(this.createTileUrlFunction())
  },
  currentProjection () {
    this.source.setTileUrlFunction(this.createTileUrlFunction())
  },
  currentMinZoom () {
    this.source.setTileUrlFunction(this.createTileUrlFunction())
  },
  currentMaxZoom () {
    this.source.setTileUrlFunction(this.createTileUrlFunction())
  }
}

export default {
  mixins: [ source ],
  props,
  computed,
  methods,
  watch
}
