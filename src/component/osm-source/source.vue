<script>
  import OSMSource from 'ol/source/OSM'
  import xyzSource from '../../mixin/xyz-source'

  const OSM_ATTRIBUTIONS = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors.'
  const OSM_URL_TEMPLATE = 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const OSM_MAX_ZOOM = 19

  const props = {
    attributions: {
      type: [String, Array],
      default: OSM_ATTRIBUTIONS,
    },
    maxZoom: {
      type: Number,
      default: OSM_MAX_ZOOM,
    },
    url: {
      type: String,
      default: OSM_URL_TEMPLATE,
    },
  }

  const methods = {
    createSource () {
      // always EPSG:3857, size: 256x256, format png
      return new OSMSource({
        url: this.urlTmpl,
        attributions: this.attributions,
        crossOrigin: this.crossOrigin,
        maxZoom: this.maxZoom,
        cacheSize: this.cacheSize,
        opaque: this.opaque,
        reprojectionErrorThreshold: this.reprojectionErrorThreshold,
        wrapX: this.wrapX,
        transition: this.transition,
      })
    },
  }

  export default {
    name: 'vl-source-osm',
    mixins: [xyzSource],
    props,
    methods,
  }
</script>
