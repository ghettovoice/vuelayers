<script>
  import { TileWMS as TileWMSSource } from 'ol/source'
  import { tileImageSource, wmsSource } from '../../mixin'
  import { makeWatchers } from '../../util/vue-helpers'

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
    watch: {
      ...makeWatchers([
        'gutter',
        'hidpi',
        'serverType',
      ], prop => async function () {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`${prop} changed, scheduling recreate...`)
        }

        await this.scheduleRecreate()
      }),
    },
    methods: {
      createSource () {
        return new TileWMSSource({
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
          tileClass: this.tileClass,
          // ol/source/TileWMS
          gutter: this.gutter,
          hidpi: this.hidpi,
          serverType: this.serverType,
          params: this.allParams,
        })
      },
      async onTileUrlFuncChanged (tileUrlFunc) {},
    },
  }
</script>
