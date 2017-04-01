import proj from 'ol/proj'
import tilegrid from 'ol/tilegrid'
import { createTileUrlFunction } from 'ol-tilecache'
import { pick } from 'lodash/fp'
import { consts } from '../../ol'
import replaceTokens from '../../utils/replace-tokens'
import source from './source'

const { TILE_SIZE, CACHE_SIZE, MIN_ZOOM, MAX_ZOOM, PIXEL_RATIO } = consts

const props = {
  url: {
    type: String,
    required: true
  },
  tileSize: {
    type: Array,
    default: () => [ TILE_SIZE, TILE_SIZE ],
    validator: value => Array.isArray(value) && value.length === 2
  },
  tilePixelRatio: {
    type: Number,
    default: PIXEL_RATIO
  },
  crossOrigin: {
    type: String,
    default: 'anonymous'
  },
  cacheSize: {
    type: Number,
    default: CACHE_SIZE
  },
  opaque: Boolean,
  minZoom: {
    type: Number,
    default: MIN_ZOOM
  },
  maxZoom: {
    type: Number,
    default: MAX_ZOOM
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
   * @return {TileGrid}
   * @protected
   */
  createTileGrid () {
    /**
     * @type {Extent}
     * @protected
     */
    this.tileGridExtent = proj.get(this.currentProjection).getExtent()
    /**
     * @type {TileGrid}
     * @protected
     */
    this.tileGrid = tilegrid.createXYZ({
      extent: this.tileGridExtent,
      minZoom: this.currentMinZoom,
      maxZoom: this.currentMaxZoom,
      tileSize: this.currentTileSize
    })

    return this.tileGrid
  },
  /**
   * @return {TileUrlFunction}
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
