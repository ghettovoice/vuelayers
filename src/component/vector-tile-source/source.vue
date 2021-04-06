<script>
  import Feature from 'ol/Feature'
  import VectorTileSource from 'ol/source/VectorTile'
  import { observableFromOlEvent } from '../../rx-ext'
  import { hasSource } from '../../util/assert'
  import { forEach } from '../../util/minilo'
  import { tileSource } from '../../mixin'
  import { createMvtFmt, initializeFeature } from '../../ol-ext'

  export default {
    name: 'vl-source-vector-tile',
    mixins: [tileSource],
    props: {
      cacheSize: {
        type: Number,
        default: 128,
      },
      /**
       * Source format factory
       * @type {(function(): Feature|undefined)} formatFactory
       */
      formatFactory: {
        type: Function,
        default: defaultFormatFactory,
      },
      overlaps: {
        type: Boolean,
        default: true,
      },
    },
    computed: {
      dataFormat () {
        return this.formatFactory()
      },
    },
    methods: {
      /**
       * @return {VectorTileSource}
       */
      createSource () {
        return new VectorTileSource({
          attributions: this.attributions,
          cacheSize: this.cacheSize,
          format: this.dataFormat,
          logo: this.logo,
          overlaps: this.overlaps,
          projection: this.projection,
          tileGrid: this._tileGrid,
          tileLoadFunction: this.tileLoadFunction,
          tileUrlFunction: this.urlFunc,
          wrapX: this.wrapX,
          transition: this.transition,
        })
      },
      subscribeAll () {
        this::tileSource.methods.subscribeAll()
        this::subscribeToSourceEvents()
      },
    },
  }

  /**
   * @return {TopoJSON}
   */
  function defaultFormatFactory () {
    return createMvtFmt()
  }

  function subscribeToSourceEvents () {
    hasSource(this)

    this.subscribeTo(observableFromOlEvent(this.$source, 'tileloadend'), evt => {
      if (!evt.tile) {
        return
      }

      forEach(evt.tile.getFeatures(), feature => {
        if (!(feature instanceof Feature)) {
          return
        }
        initializeFeature(feature)
      })
    })
  }
</script>
