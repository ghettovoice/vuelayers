<script>
  import { source, urlTileSource, xyzSource } from '../../mixins'

  const SPUTNIK_URL_TEMPLATE = 'http://tiles.maps.sputnik.ru/{z}/{x}/{y}.png?apikey={apikey}'
  const SPUTNIK_ATTRIBUTIONS = '&copy; <a href="http://rt.ru/" target="_blank">Ростелеком</a>. '

  export default {
    name: 'VlSourceSputnik',
    mixins: [
      xyzSource,
    ],
    props: {
      /* eslint-disable vue/require-prop-types */
      // ol/source/Source
      attributions: {
        ...source.props.attributions,
        default: SPUTNIK_ATTRIBUTIONS,
      },
      // ol/source/UrlTile
      url: {
        ...urlTileSource.props.url,
        default: SPUTNIK_URL_TEMPLATE,
      },
      /* eslint-enable vue/require-prop-types */
      // custom
      apiKey: {
        type: String,
      },
    },
    computed: {
      /**
       * @type {string[]}
       */
      urlTokens () {
        return ['apiKey']
      },
    },
  }
</script>
