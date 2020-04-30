<script>
  import { xyzSource } from '../../mixin'
  import { EPSG_3857 } from '../../ol-ext'
  import { coalesce } from '../../util/minilo'

  const MAPBOX_URL_TEMPLATE = 'https://{a-c}.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}{tileNameSuffix}.{tileFormat}?access_token={accessToken}'
  const MAPBOX_ATTRIBUTIONS = '&copy; <a href="https://www.mapbox.com/" target="_blank">MapBox</a>, ' + (new Date().getFullYear())

  export default {
    name: 'VlSourceMapbox',
    mixins: [
      xyzSource,
    ],
    props: {
      // ol/source/Source
      attributions: {
        type: [String, Array],
        default: MAPBOX_ATTRIBUTIONS,
      },
      // ol/source/UrlTile
      url: {
        type: String,
        default: MAPBOX_URL_TEMPLATE,
      },
      // custom
      accessToken: {
        type: String,
        required: true,
      },
      mapId: {
        type: String,
        required: true,
      },
      projection: {
        type: String,
        default: EPSG_3857,
      },
      tileFormat: {
        type: String,
        default: 'png',
      },
    },
    computed: {
      /**
       * @type {string}
       */
      tileNameSuffix () {
        return tileNameSuffix(this.tilePixelRatio)
      },
      /**
       * @type {string[]}
       */
      urlTokens () {
        return ['mapId', 'accessToken', 'tileNameSuffix', 'tileFormat']
      },
    },
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

    return ratio > 1 ? ['@', ratio, 'x'].join('') : ''
  }
</script>
