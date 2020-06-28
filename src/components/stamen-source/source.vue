<script>
  import StamenSource from 'ol/source/Stamen'
  import { xyzSource } from '../../mixin'

  export default {
    name: 'VlSourceStamen',
    mixins: [
      xyzSource,
    ],
    props: {
      // ol/source/UrlTile
      /**
       * If nothing provided then default url resolved
       * with current layer params will be used.
       * @see {ol.source.Stamen}
       *
       * @type {string}
       */
      url: String,
      // ol/source/Stamen
      /**
       * Stamen layer name
       *
       * @type {string}
       */
      layer: {
        type: String,
        required: true,
      },
    },
    methods: {
      createSource () {
        return new StamenSource({
          // ol/source/Source
          wrapX: this.wrapX,
          // ol/source/Tile
          cacheSize: this.cacheSize,
          opaque: this.opaque,
          transition: this.transition,
          // ol/source/UrlTile
          tileLoadFunction: this.resolvedTileLoadFunc,
          url: this.parsedUrl,
          // ol/source/TileImage
          reprojectionErrorThreshold: this.reprojectionErrorThreshold,
          // ol/source/XYZ
          minZoom: this.minZoom,
          maxZoom: this.maxZoom,
          // ol/source/Stamen
          layer: this.layer,
        })
      },
    },
  }
</script>
