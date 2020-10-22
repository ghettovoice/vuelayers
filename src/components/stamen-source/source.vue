<script>
  import { Stamen as StamenSource } from 'ol/source'
  import { xyzSource } from '../../mixins'
  import { noop } from '../../utils'

  export default {
    name: 'VlSourceStamen',
    mixins: [
      xyzSource,
    ],
    props: {
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
    computed: {
      tileGridIdent: noop,
      inputTileGridFactory: noop,
      inputTileUrlFunction: noop,
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
          tileLoadFunction: this.currentTileLoadFunction,
          url: this.currentUrls[0],
          // ol/source/TileImage
          reprojectionErrorThreshold: this.reprojectionErrorThreshold,
          imageSmoothing: this.imageSmoothing,
          // ol/source/XYZ
          minZoom: this.minZoom,
          maxZoom: this.maxZoom,
          // ol/source/Stamen
          layer: this.layer,
        })
      },
      inputUrlChanged (value) {
        this.setUrl(value)
      },
      attributionsCollapsibleChanged: noop,
      projectionChanged: noop,
      inputTileGridFactoryChanged: noop,
      tileGridChanged: noop,
      zDirectionChanged: noop,
      inputTileUrlFunctionChanged: noop,
      crossOriginChanged: noop,
      tileClassChanged: noop,
    },
  }
</script>
