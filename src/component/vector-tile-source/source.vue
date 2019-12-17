<script>
  import VectorTileSource from 'ol/source/VectorTile'
  import { tileSource } from '../../mixin'
  import { createMvtFmt } from '../../ol-ext'

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
    },
  }

  /**
   * @return {TopoJSON}
   */
  function defaultFormatFactory () {
    return createMvtFmt()
  }
</script>
