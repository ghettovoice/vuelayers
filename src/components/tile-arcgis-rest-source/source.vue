<script>
  import { TileArcGISRest as TileArcGISRestSource } from 'ol/source'
  import { tileImageSource, arcgisSource } from '../../mixins'
  import { noop } from '../../utils'

  export default {
    name: 'VlSourceTileArcgisRest',
    mixins: [
      arcgisSource,
      tileImageSource,
    ],
    computed: {
      inputTileUrlFunction: noop,
    },
    methods: {
      createSource () {
        return new TileArcGISRestSource({
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
          imageSmoothing: this.imageSmoothing,
          // ol/source/TileArcGISRest
          hidpi: this.hidpi,
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
      tileClassChanged: noop,
    },
  }
</script>
