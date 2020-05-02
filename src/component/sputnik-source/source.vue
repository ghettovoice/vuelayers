<script>
  import { xyzSource } from '../../mixin'

  const SPUTNIK_URL_TEMPLATE = 'http://tiles.maps.sputnik.ru/{z}/{x}/{y}.png?apikey={apikey}'
  const SPUTNIK_ATTRIBUTIONS = '<a href="http://maps.sputnik.ru/" target="_blank">Спутник</a> ' +
    '&copy; <a href="http://rt.ru/" target="_blank">Ростелеком</a>, ' +
    (new Date().getFullYear())

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
