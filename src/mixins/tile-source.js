import { pick } from 'lodash/fp'
import { createTileUrlFunction } from 'ol3-tilecache'
import { replaceTokens } from 'vuelayers/src/utils/func'
import source from 'vuelayers/src/mixins/source'
import { consts as olConsts } from 'vuelayers/src/ol'

const props = {
  url: {
    type: String,
    default: '',
    required: true
  },
  tileSize: {
    type: Array,
    default: () => [ olConsts.TILE_SIZE, olConsts.TILE_SIZE ],
    validator: value => value.length === 2
  },
  tilePixelRatio: {
    type: Number,
    default: 1
  },
  crossOrigin: {
    type: String,
    default: 'anonymous'
  },
  cacheSize: {
    type: Number,
    default: 2048
  }
}

const computed = {
  urlTokens () {
    return []
  }
}

const methods = {
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
  name: 'vl-tile-source',
  mixins: [ source ],
  props,
  computed,
  methods
}
