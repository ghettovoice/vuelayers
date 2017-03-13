<script>
  import xyzSource from 'vl-components/source/xyz-base'
  import { coalesce, constant } from 'vl-utils/func'
  import { consts as olConsts } from 'vl-ol'

  const MAPBOX_URL_TEMPLATE = 'https://{a-c}.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}{tileNameSuffix}.{tileFormat}?access_token={accessToken}'
  const MAPBOX_ATTRIBUTIONS = '© <a href="https://www.mapbox.com/">MapBox</a>, ' + (new Date().getFullYear())

  const props = {
    url: {
      type: String,
      default: MAPBOX_URL_TEMPLATE
    },
    accessToken: {
      type: String,
      required: true
    },
    mapId: {
      type: String,
      required: true
    },
    attributions: {
      type: String,
      default: MAPBOX_ATTRIBUTIONS
    },
    tileFormat: {
      type: String,
      default: 'png'
    }
  }

  const computed = {
    // bind to constant values: projection and tile size
    currentProjection: constant(olConsts.MAP_PROJECTION),
    currentTileSize: constant([ olConsts.TILE_SIZE, olConsts.TILE_SIZE ]),
    tileNameSuffix () {
      return tileNameSuffix(this.tilePixelRatio)
    },
    urlTokens () {
      return [
        'mapId',
        'accessToken',
        'tileNameSuffix',
        'tileFormat'
      ]
    }
  }

  export default {
    name: 'vl-source-mapbox',
    mixins: [ xyzSource ],
    props,
    computed
  }

  /**
   * @param {number} [ratio]
   * @returns {number}
   * @private
   */
  function tileRatio (ratio) {
    ratio = coalesce(ratio, 1)

    return ratio > 1 ? 2 : 1
  }

  /**
   * @param {number} [ratio]
   * @returns {string}
   * @private
   */
  function tileNameSuffix (ratio) {
    ratio = tileRatio(ratio)

    return ratio > 1 ? [ '@', ratio, 'x' ].join('') : ''
  }
</script>

<style>/* stub style  */</style>
