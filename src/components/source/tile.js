import { isPlainObject, pick } from 'lodash/fp'
import proj from 'ol/proj'
import TileGrid from 'ol/tilegrid/tilegrid'
import { consts, tileGridHelper } from '../../ol-ext'
import replaceTokens from '../../utils/replace-tokens'
import source from './source'

const { CACHE_SIZE, PIXEL_RATIO, MIN_ZOOM, MAX_ZOOM, TILE_SIZE } = consts

const props = {
  url: {
    type: String,
    required: true
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
  reprojectionErrorThreshold: {
    type: Number,
    default: 0.5
  },
  tileSize: {
    type: Array,
    default: () => [ TILE_SIZE, TILE_SIZE ],
    validator: value => Array.isArray(value) && value.length === 2
  },
  minZoom: {
    type: Number,
    default: MIN_ZOOM
  },
  maxZoom: {
    type: Number,
    default: MAX_ZOOM
  },
  gridOpts: {
    type: Object,
    validator: value => isPlainObject(value) &&
                        Array.isArray(value.resolutions) &&
                        value.resolutions.length
  }
}

const computed = {
  currentUrl () {
    return replaceTokens(this.url, pick(this.urlTokens, this))
  },
  currentTilePixelRatio () {
    return this.tilePixelRatio
  },
  urlTokens () {
    return []
  },
  currentTileSize () {
    return this.tileSize
  },
  currentMinZoom () {
    return this.minZoom
  },
  currentMaxZoom () {
    return this.maxZoom
  },
  currentProjectionExtent () {
    return proj.get(this.currentProjection).getExtent()
  },
  currentGridOpts () {
    return {
      resolutions: tileGridHelper.resolutionsFromExtent(
        this.currentProjectionExtent,
        this.currentMaxZoom,
        this.currentTileSize
      ),
      minZoom: this.currentMinZoom,
      extent: this.currentProjectionExtent,
      ...this.gridOpts
    }
  }
}

const methods = {
  /**
   * @return {ol.tilegrid.TileGrid}
   */
  createTileGrid () {
    return new TileGrid(this.currentGridOpts)
  },
  initialize () {
    if (this.currentGridOpts) {
      this.tileGrid = this.createTileGrid()
    }

    this::source.methods.initialize()
  }
}

const watch = {
  currentUrl () {
    this.source.setUrl(this.currentUrl)
  }
}

export default {
  mixins: [ source ],
  props,
  computed,
  methods,
  watch,
  destroyed () {
    this.tileGrid = undefined
  }
}
