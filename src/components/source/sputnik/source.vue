<script>
  /**
   * Layer source to work with Sputnik.ru tile server.
   */
  import { consts } from '../../../ol-ext'
  import xyzSource from '../xyz/source.vue'

  const { TILE_SIZE, MAP_PROJECTION } = consts
  const SPUTNIK_URL_TEMPLATE = 'http://tiles.maps.sputnik.ru/{z}/{x}/{y}.png?apikey={apikey}'
  const SPUTNIK_ATTRIBUTIONS = '<a href="http://maps.sputnik.ru/">Спутник</a> ' +
                               '&copy; <a href="http://rt.ru/">Ростелеком</a> ' +
                               '&copy; <a href="https://openstreetmap.org/">Openstreetmap</a>, ' +
                               (new Date().getFullYear())

  const props = {
    url: {
      type: String,
      default: SPUTNIK_URL_TEMPLATE
    },
    apiKey: {
      type: String
    },
    attributions: {
      type: String,
      default: SPUTNIK_ATTRIBUTIONS
    }
  }

  const computed = {
    // bind to constant values: projection and tile size
    currentProjection: () => MAP_PROJECTION,
    currentTileSize: () => [ TILE_SIZE, TILE_SIZE ],
    urlTokens () {
      return [
        'apiKey'
      ]
    }
  }

  export default {
    name: 'vl-source-sputnik',
    mixins: [ xyzSource ],
    props,
    computed
  }
</script>
