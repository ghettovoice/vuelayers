<script>
  import { BingMaps as BingMapsSource } from 'ol/source'
  import { tileSource } from '../../mixin'
  import { makeWatchers } from '../../util/vue-helpers'

  export default {
    name: 'VlSourceBingmaps',
    mixins: [
      tileSource,
    ],
    props: {
      // ol/source/XYZ
      maxZoom: {
        type: Number,
        default: 21,
      },
      // ol/source/BingMaps
      /**
       * Enables hidpi tiles.
       * @type {boolean}
       */
      hidpi: {
        type: Boolean,
        default: false,
      },
      /**
       * Culture code.
       * @type {string}
       */
      culture: {
        type: String,
        default: 'en-us',
      },
      /**
       * Bing Maps API key.
       * @type {string}
       */
      apiKey: {
        type: String,
        required: true,
      },
      /**
       * Type of imagery.
       * @type {string}
       */
      imagerySet: {
        type: String,
        required: true,
      },
    },
    watch: {
      ...makeWatchers([
        'apiKey',
        'imagerySet',
      ], prop => async function () {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`${prop} changed, scheduling recreate...`)
        }

        await this.scheduleRecreate()
      }),
    },
    methods: {
      /**
       * @return {module:ol/source/BingMaps}
       * @protected
       */
      createSource () {
        return new BingMapsSource({
          // ol/source/Source
          wrapX: this.wrapX,
          // ol/source/Tile
          cacheSize: this.cacheSize,
          opaque: this.opaque,
          transition: this.transition,
          // ol/source/UrlTile
          tileLoadFunction: this.tileLoadFunction,
          // ol/source/TileImage
          crossOrigin: this.crossOrigin,
          reprojectionErrorThreshold: this.reprojectionErrorThreshold,
          // ol/source/XYZ
          maxZoom: this.maxZoom,
          // ol/source/BingMaps
          hidpi: this.hidpi,
          culture: this.culture,
          key: this.apiKey,
          imagerySet: this.imagerySet,
        })
      },
    },
  }
</script>
