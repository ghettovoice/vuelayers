<script>
  import { BingMaps as BingMapsLayer } from 'ol/source'
  import { tileSource } from '../../mixin'
  import { makeWatchers } from '../../util/vue-helpers'
  import { omit } from '../../util/minilo'

  const BINGMAPS_MAX_ZOOM = 21
  const BINGMAPS_CULTURE = 'en-us'

  export default {
    name: 'VlSourceBingmaps',
    mixins: [
      {
        ...tileSource,
        props: omit(tileSource, ['url']),
      },
    ],
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
    },
    watch: {
      ...makeWatchers([
        'apiKey',
        'imagerySet',
      ], () => function () {
        this.scheduleRecreate()
      }),
    },
    methods: {
      /**
       * @return {module:ol/source/BingMaps}
       * @protected
       */
      createSource () {
        return new BingMapsLayer({
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
  }
</script>
