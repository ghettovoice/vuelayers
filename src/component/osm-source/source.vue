<script>
  import OSMSource from 'ol/source/OSM'
  import { xyzSource } from '../../mixin'

  const OSM_ATTRIBUTIONS = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors.'
  const OSM_URL_TEMPLATE = 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const OSM_MAX_ZOOM = 19

  export default {
    name: 'VlSourceOsm',
    mixins: [
      xyzSource,
    ],
    props: {
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
    },
    methods: {
      createSource () {
        // always EPSG:3857, size: 256x256, format png
        return new OSMSource({
          maxZoom: this.maxZoom,
          // ol/source/Source
          attributions: this.attributions,
          wrapX: this.wrapX,
          // ol/source/Tile
          cacheSize: this.cacheSize,
          opaque: this.opaque,
          transition: this.transition,
          // ol/source/UrlTile
          tileUrlFunction: this.urlFunc,
          // ol/source/TileImage
          crossOrigin: this.crossOrigin,
          reprojectionErrorThreshold: this.reprojectionErrorThreshold,
        })
      },
    },
  }
</script>
