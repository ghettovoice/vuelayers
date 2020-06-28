<script>
  import { TileArcGISRest as TileArcGISRestSource } from 'ol/source'
  import { tileImageSource, arcgisSource } from '../../mixin'

  export default {
    name: 'VlSourceTileArcgisRest',
    mixins: [
      arcgisSource,
      tileImageSource,
    ],
    methods: {
      createSource () {
        return new TileArcGISRestSource({
          // ol/source/Source
          attributions: this.currentAttributions,
          projection: this.projection,
          wrapX: this.wrapX,
          // ol/source/Tile
          cacheSize: this.cacheSize,
          tileGrid: this.tileGrid,
          transition: this.transition,
          // ol/source/UrlTile
          tileLoadFunction: this.resolvedTileLoadFunc,
          urls: this.expandedUrls,
          // ol/source/TileImage
          crossOrigin: this.crossOrigin,
          reprojectionErrorThreshold: this.reprojectionErrorThreshold,
          // ol/source/TileArcGISRest
          hidpi: this.hidpi,
          params: this.allParams,
        })
      },
      async onTileUrlFuncChanged (tileUrlFunc) {},
    },
  }
</script>
