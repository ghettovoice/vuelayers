import { pick } from 'lodash/fp'
import { createTileUrlFunction } from 'ol3-tilecache'
import { replaceTokens } from 'vuelayers/src/utils/func'
import source from 'vuelayers/src/mixins/source'
import { TILE_SIZE } from 'vuelayers/src/ol'

const urlTokens = [
  'layerName',
  'tileFormat'
]
const pickUrlTokens = pick(urlTokens)

const props = {
  url: String,
  tileFormat: {
    type: String,
    default: 'png'
  },
  tileSize: {
    type: Array,
    default: () => [ TILE_SIZE, TILE_SIZE ],
    validator: value => value.length === 2
  },
  tilePixelRatio: {
    type: Number,
    default: 1
  },
  layerName: String,
  crossOrigin: {
    type: String,
    default: 'anonymous'
  },
  cacheSize: {
    type: Number,
    default: 2048
  }
}

const methods = {
  /**
   * @return {ol.TileUrlFunction}
   * @protected
   */
  createTileUrlFunction () {
    return createTileUrlFunction(replaceTokens(this.url, pickUrlTokens(this)))
  }
}

export default {
  name: 'vl-tile-source',
  mixins: [ source ],
  props,
  methods,
  render: h => h()
}
