<script>
  import { BingMaps as BingMapsSource } from 'ol/source'
  import { tileImageSource } from '../../mixin'
  import { makeWatchers } from '../../util/vue-helpers'

  export default {
    name: 'VlSourceBingmaps',
    mixins: [
      tileImageSource,
    ],
    props: {
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
      maxZoom: {
        type: Number,
        default: 21,
      },
    },
    watch: {
      async apiKey (value) {
        if (value === await this.getApiKey()) return

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('apiKey changed, scheduling recreate...')
        }

        await this.scheduleRecreate()
      },
      async imagerySet (value) {
        if (value === await this.getImagerySet()) return

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('imagerySet changed, scheduling recreate...')
        }

        await this.scheduleRecreate()
      },
      ...makeWatchers([
        'hidpi',
        'culture',
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
          tileLoadFunction: this.resolvedTileLoadFunc,
          // ol/source/TileImage
          reprojectionErrorThreshold: this.reprojectionErrorThreshold,
          // ol/source/BingMaps
          hidpi: this.hidpi,
          culture: this.culture,
          key: this.apiKey,
          imagerySet: this.imagerySet,
          maxZoom: this.maxZoom,
        })
      },
      async getApiKey () {
        return (await this.resolveSource()).getApiKey()
      },
      async getImagerySet () {
        return (await this.resolveSource()).getImagerySet()
      },
      async onTileUrlFuncChanged (tileUrlFunc) {},
    },
  }
</script>
