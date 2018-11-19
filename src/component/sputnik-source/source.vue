<script>
  import xyzSource from '../../mixin/xyz-source'

  /**
   * Layer source to work with Sputnik.ru tile server.
   */

  const SPUTNIK_URL_TEMPLATE = 'http://tiles.maps.sputnik.ru/{z}/{x}/{y}.png?apikey={apikey}'
  const SPUTNIK_ATTRIBUTIONS = '<a href="http://maps.sputnik.ru/" target="_blank">Спутник</a> ' +
    '&copy; <a href="http://rt.ru/" target="_blank">Ростелеком</a>, ' +
    (new Date().getFullYear())

  const props = {
    url: {
      type: String,
      default: SPUTNIK_URL_TEMPLATE,
    },
    apiKey: {
      type: String,
    },
    attributions: {
      type: String,
      default: SPUTNIK_ATTRIBUTIONS,
    },
  }

  const computed = {
    /**
     * @type {string[]}
     */
    urlTokens () {
      return ['apiKey']
    },
  }

  export default {
    name: 'vl-source-sputnik',
    mixins: [xyzSource],
    props,
    computed,
  }
</script>
