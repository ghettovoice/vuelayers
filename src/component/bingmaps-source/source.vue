<script>
  import BingMapsSource from 'ol/source/BingMaps'
  import { tileSource } from '../../mixin'
  import { makeWatchers } from '../../util/vue-helpers'

  const BINGMAPS_MAX_ZOOM = 21
  const BINGMAPS_CULTURE = 'en-us'

  export default {
    name: 'vl-source-bingmaps',
    mixins: [tileSource],
    props: {
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
        default: BINGMAPS_CULTURE,
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
        default: BINGMAPS_MAX_ZOOM,
      },
      url: String,
    },
    methods: {
      /**
       * @return {BingMaps}
       * @protected
       */
      createSource () {
        return new BingMapsSource({
          cacheSize: this.cacheSize,
          hidpi: this.hidpi,
          culture: this.culture,
          key: this.apiKey,
          imagerySet: this.imagerySet,
          maxZoom: this.maxZoom,
          reprojectionErrorThreshold: this.reprojectionErrorThreshold,
          wrapX: this.wrapX,
          transition: this.transition,
          tileLoadFunction: this.tileLoadFunction,
        })
      },
    },
    watch: {
      ...makeWatchers([
        'apiKey',
        'imagerySet',
      ], () => function () {
        this.scheduleRecreate()
      }),
    },
  }
</script>
