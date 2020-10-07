<script>
  import { xyzSource } from '../../mixins'

  const SPUTNIK_URL_TEMPLATE = 'http://tiles.maps.sputnik.ru/{z}/{x}/{y}.png?apikey={apikey}'
  const SPUTNIK_ATTRIBUTIONS = '&copy; <a href="http://rt.ru/" target="_blank">Ростелеком</a>. '

  export default {
    name: 'VlSourceSputnik',
    mixins: [
      xyzSource,
    ],
    props: {
      // ol/source/Source
      attributions: {
        type: String,
        default: SPUTNIK_ATTRIBUTIONS,
      },
      // ol/source/UrlTile
      url: {
        type: String,
        default: SPUTNIK_URL_TEMPLATE,
      },
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
