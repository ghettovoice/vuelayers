<script>
  import ol from 'openlayers'
  import xyzSource from 'vuelayers/src/mixins/sources/xyz'

  const props = {
    attributions: {
      type: String,
      default: ol.source.OSM.ATTRIBUTION.getHTML()
    },
    url: {
      type: String,
      default: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    },
    maxZoom: {
      type: Number,
      default: 19
    }
  }

  const methods = {
    createSource () {
      return new ol.source.OSM({
        url: this.url,
        attributions: this.attributions,
        crossOrigin: this.crossOrigin,
        maxZoom: this.maxZoom
      })
    }
  }

  export default {
    name: 'vl-osm-source',
    mixins: [ xyzSource ],
    props,
    methods
  }
</script>

<style>
  /* stub style  */
</style>
