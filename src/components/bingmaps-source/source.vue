<script>
  import { BingMaps as BingMapsSource } from 'ol/source'
  import { makeChangeOrRecreateWatchers, tileImageSource } from '../../mixins'
  import { coalesce, noop } from '../../utils'

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
      /**
       * @type {number}
       */
      maxZoom: {
        type: Number,
        default: 21,
      },
    },
    computed: {
      tileGridIdent: noop,
      inputTileGridFactory: noop,
      inputUrl: noop,
      inputUrls: noop,
      inputTileUrlFunction: noop,
      inputAttributions: noop,
    },
    watch: {
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'hidpi',
        'culture',
        'apiKey',
        'imagerySet',
        'maxZoom',
      ]),
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
          tileLoadFunction: this.currentTileLoadFunction,
          // ol/source/TileImage
          reprojectionErrorThreshold: this.reprojectionErrorThreshold,
          imageSmoothing: this.imageSmoothing,
          // ol/source/BingMaps
          hidpi: this.hidpi,
          culture: this.culture,
          key: this.apiKey,
          imagerySet: this.imagerySet,
          maxZoom: this.maxZoom,
        })
      },
      getApiKey () {
        return coalesce(this.$source?.getApiKey(), this.apiKey)
      },
      getImagerySet () {
        return coalesce(this.$source?.getImagerySet(), this.imagerySet)
      },
      stateChanged: noop,
      attributionsCollapsibleChanged: noop,
      projectionChanged: noop,
      tileGridIdentChanged: noop,
      inputTileGridFactoryChanged: noop,
      tileGridChanged: noop,
      tileKeyChanged: noop,
      tilePixelRatioChanged: noop,
      zDirectionChanged: noop,
      inputTileUrlFunctionChanged: noop,
      inputUrlsChanged: noop,
      crossOriginChanged: noop,
      tileClassChanged: noop,
    },
  }
</script>
