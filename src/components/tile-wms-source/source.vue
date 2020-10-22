<script>
  import { TileWMS as TileWMSSource } from 'ol/source'
  import { makeChangeOrRecreateWatchers, tileImageSource, wmsSource } from '../../mixins'
  import { noop } from '../../utils'

  export default {
    name: 'VlSourceTileWms',
    mixins: [
      wmsSource,
      tileImageSource,
    ],
    props: {
      gutter: {
        type: Number,
        default: 0,
      },
    },
    computed: {
      inputTileUrlFunction: noop,
    },
    watch: {
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'gutter',
      ]),
    },
    methods: {
      createSource () {
        return new TileWMSSource({
          // ol/source/Source
          attributions: this.currentAttributions,
          projection: this.resolvedDataProjection,
          wrapX: this.wrapX,
          // ol/source/Tile
          cacheSize: this.cacheSize,
          tileGrid: this.tileGrid,
          transition: this.transition,
          // ol/source/UrlTile
          tileLoadFunction: this.currentTileLoadFunction,
          urls: this.currentUrls,
          // ol/source/TileImage
          crossOrigin: this.crossOrigin,
          reprojectionErrorThreshold: this.reprojectionErrorThreshold,
          tileClass: this.tileClass,
          imageSmoothing: this.imageSmoothing,
          // ol/source/TileWMS
          gutter: this.gutter,
          hidpi: this.hidpi,
          serverType: this.serverType,
          params: this.currentParams,
        })
      },
      stateChanged: noop,
      attributionsCollapsibleChanged: noop,
      tileKeyChanged: noop,
      opaqueChanged: noop,
      tilePixelRatioChanged: noop,
      zDirectionChanged: noop,
      inputTileUrlFunctionChanged: noop,
    },
  }
</script>
