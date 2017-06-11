import { pick } from 'lodash/fp'
import proj from 'ol/proj'
import TileGrid from 'ol/tilegrid/tilegrid'
import {
  CACHE_SIZE,
  CROSS_ORIGIN,
  MAP_PROJ,
  MAX_ZOOM,
  MIN_ZOOM,
  PIXEL_RATIO,
  REPROJ_ERR_THRESHOLD,
  TILE_SIZE,
  tileGrid as tileGridHelper
} from '../../ol-ext'
import replaceTokens from '../../utils/replace-tokens'
import source from './source'
import * as assert from '../../utils/assert'

// todo extract tileGrid into separate component!
const props = {
  cacheSize: {
    type: Number,
    default: CACHE_SIZE
  },
  crossOrigin: {
    type: String,
    default: CROSS_ORIGIN
  },
  gridOpts: {
    type: Object,
    validator: value => Array.isArray(value.resolutions) && value.resolutions.length
  },
  maxZoom: {
    type: Number,
    default: MAX_ZOOM
  },
  minZoom: {
    type: Number,
    default: MIN_ZOOM
  },
  opaque: Boolean,
  projection: {
    type: String,
    default: MAP_PROJ
  },
  reprojectionErrorThreshold: {
    type: Number,
    default: REPROJ_ERR_THRESHOLD
  },
  tilePixelRatio: {
    type: Number,
    default: PIXEL_RATIO
  },
  tileSize: {
    type: Array,
    default: () => [TILE_SIZE, TILE_SIZE],
    validator: value => value.length === 2
  },
  url: {
    type: String,
    required: true
  }
}

const computed = {
  /**
   * @type {string}
   */
  urlTmpl () {
    return replaceTokens(this.url, pick(this.urlTokens, this))
  },
  /**
   * @type {string[]}
   */
  urlTokens () { return [] },
  /**
   * @type {number[]|ol.Extent}
   */
  projectionExtent () {
    return proj.get(this.projection).getExtent()
  },
  /**
   * @type {Object}
   */
  preparedGridOpts () {
    return {
      resolutions: tileGridHelper.resolutionsFromExtent(
        this.projectionExtent,
        this.maxZoom,
        this.tileSize
      ),
      minZoom: this.minZoom,
      extent: this.projectionExtent,
      ...this.gridOpts
    }
  }
}

const methods = {
  /**
   * @return {ol.tilegrid.TileGrid}
   * @protected
   */
  createTileGrid () {
    return new TileGrid(this.preparedGridOpts)
  },
  /**
   * @return {void}
   * @protected
   */
  init () {
    if (this.preparedGridOpts) {
      /**
       * @type {ol.tilegrid.TileGrid}
       * @protected
       */
      this.tileGrid = this.createTileGrid()
    }

    this::source.methods.init()
  },
  /**
   * @return {void}
   * @protected
   */
  deinit () {
    this.tileGrid = undefined
    this::source.methods.deinit()
  }
}

const watch = {
  urlTmpl (value) {
    assert.hasSource(this)
    this.source.setUrl(value)
  }
}

export default {
  mixins: [source],
  props,
  computed,
  methods,
  watch
}
