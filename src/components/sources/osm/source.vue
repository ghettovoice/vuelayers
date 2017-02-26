<script>
  import ol from 'openlayers'
  import { createAttributions } from 'vuelayers/src/ol'
  import tileSource from 'vuelayers/src/mixins/tile-source'

  const props = {
    attributions: {
      type: Array,
      default: ol.source.OSM.ATTRIBUTION.getHTML()
    },
    url: {
      type: String,
      default: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    }
  }

  const computed = {
  }

  const methods = {
    createSource () {
      return new ol.source.OSM({
        url: this.url,
        attributions: createAttributions(this.attributions),
        crossOrigin: this.crossOrigin
      })
    }
  }

  export default {
    name: 'vl-osm-source',
    mixin: [ tileSource ],
    props,
    computed,
    methods
  }
</script>
