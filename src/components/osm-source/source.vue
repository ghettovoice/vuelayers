<script>
  import OSMSource from 'ol/source/osm'
  import XyzSource from '../xyz-source'

  const OSM_URL_TEMPLATE = 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const OSM_MAX_ZOOM = 19

  const props = {
    attributions: {
      type: String,
      default: OSMSource.ATTRIBUTION.getHTML(),
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
      })
    },
  }

  export default {
    name: 'vl-source-osm',
    extends: XyzSource.Source,
    props,
    methods,
  }
</script>
