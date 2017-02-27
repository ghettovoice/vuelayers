<script>
  import ol from 'openlayers'
  import tileSource from 'vuelayers/src/mixins/tile-source'

  const props = {
    attributions: {
      type: String,
      default: ol.source.OSM.ATTRIBUTION.getHTML()
    },
    url: {
      type: String,
      default: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    }
  }

  const methods = {
    createSource () {
      return new ol.source.OSM({
        url: this.url,
        attributions: this.attributions,
        crossOrigin: this.crossOrigin
      })
    }
  }

  export default {
    name: 'vl-osm-source',
    mixins: [ tileSource ],
    props,
    methods
  }
</script>

<style>
  /* stub style  */
</style>
