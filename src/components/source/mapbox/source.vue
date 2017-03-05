<script>
  import xyzSource from 'vl-components/source/xyz-base'
  import { coalesce } from 'vl-utils/func'

  const props = {
    url: {
      type: String,
      default: 'https://{a-c}.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}{tileNameSuffix}.{tileFormat}?access_token={accessToken}'
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
      default: '© <a href="https://www.mapbox.com/">MapBox</a>, ' + (new Date().getFullYear())
    },
    tileFormat: {
      type: String,
      default: 'png'
    }
  }

  const computed = {
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

<style>
  /* stub style  */
</style>
