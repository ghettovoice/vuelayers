import { pick } from 'lodash/fp'
import proj from 'ol/proj'
import TileGrid from 'ol/tilegrid/tilegrid'
import { consts, tileGridHelper } from '../../ol-ext'
import replaceTokens from '../../utils/replace-tokens'
import source from './source'
import { assertHasSource } from '../../utils/assert'

const {
  CACHE_SIZE,
  PIXEL_RATIO,
  MIN_ZOOM,
  MAX_ZOOM,
  TILE_SIZE,
  CROSS_ORIGIN,
  REPROJ_ERR_THRESHOLD,
  MAP_PROJECTION
} = consts
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
    default: MAP_PROJECTION
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
   * @protected
   */
  initialize () {
    if (this.preparedGridOpts) {
      /**
       * @type {ol.tilegrid.TileGrid}
       * @protected
       */
      this.tileGrid = this.createTileGrid()
    }

    this::source.methods.initialize()
  }
}

const watch = {
  urlTmpl (value) {
    assertHasSource(this)
    this.source.setUrl(value)
  }
}

export default {
  mixins: [source],
  props,
  computed,
  methods,
  watch,
  destroyed () {
    this.tileGrid = undefined
  }
}
