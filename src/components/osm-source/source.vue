<script>
  import { OSM as OSMSource } from 'ol/source'
  import { makeChangeOrRecreateWatchers, source, urlTileSource, xyzSource } from '../../mixins'
  import { noop } from '../../utils'

  const OSM_ATTRIBUTIONS = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors.'
  const OSM_URL_TEMPLATE = 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const OSM_MAX_ZOOM = 19

  export default {
    name: 'VlSourceOsm',
    mixins: [
      xyzSource,
    ],
    props: {
      /* eslint-disable vue/require-prop-types */
      // ol/source/Source
      attributions: {
        ...source.props.attributions,
        default: OSM_ATTRIBUTIONS,
      },
      // ol/source/UrlTile
      url: {
        ...urlTileSource.props.url,
        default: OSM_URL_TEMPLATE,
      },
      // ol/source/XYZ
      maxZoom: {
        ...xyzSource.props.maxZoom,
        default: OSM_MAX_ZOOM,
      },
      /* eslint-enable vue/require-prop-types */
    },
    computed: {
      tileGridIdent: noop,
      inputTileGridFactory: noop,
      inputTileUrlFunction: noop,
    },
    watch: {
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'inputUrl',
        'maxZoom',
      ]),
    },
    methods: {
      createSource () {
        // always EPSG:3857, size: 256x256, format png
        return new OSMSource({
          // ol/source/Source
          attributions: this.currentAttributions,
          wrapX: this.wrapX,
          // ol/source/Tile
          cacheSize: this.cacheSize,
          opaque: this.opaque,
          // ol/source/UrlTile
          tileLoadFunction: this.currentTileLoadFunction,
          url: this.currentUrls[0],
          // ol/source/TileImage
          crossOrigin: this.crossOrigin,
          reprojectionErrorThreshold: this.reprojectionErrorThreshold,
          imageSmoothing: this.imageSmoothing,
          // ol/source/XYZ
          maxZoom: this.maxZoom,
        })
      },
      inputUrlChanged (value) {
        this.setUrl(value)
      },
      // skip all other handlers
      tileClassChanged: noop,
      inputTileUrlFunctionChanged: noop,
      inputTileGridFactoryChanged: noop,
      tileGridChanged: noop,
      tilePixelRatioChanged: noop,
      transitionChanged: noop,
      zDirectionChanged: noop,
      attributionsCollapsibleChanged: noop,
      projectionChanged: noop,
    },
  }
</script>
