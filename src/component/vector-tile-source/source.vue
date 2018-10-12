<script>
  import VectorTileSource from 'ol/source/VectorTile'
  import tileSource from '../../mixin/tile-source'
  import { createMvtFmt } from '../../ol-ext/format'

  const props = {
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
  }

  const methods = {
    /**
     * @return {VectorTileSource}
     */
    createSource () {
      return new VectorTileSource({
        attributions: this.attributions,
        cacheSize: this.cacheSize,
        format: this.formatFactory(),
        logo: this.logo,
        overlaps: this.overlaps,
        projection: this.projection,
        tileGrid: this._tileGrid,
        tileLoadFunction: this.tileLoadFunction,
        tileUrlFunction: this.createUrlFunc(),
        wrapX: this.wrapX,
        transition: this.transition,
      })
    },
  }

  export default {
    name: 'vl-source-vector-tile',
    mixins: [tileSource],
    props,
    methods,
  }

  /**
   * @return {TopoJSON}
   */
  function defaultFormatFactory () {
    return createMvtFmt()
  }
</script>
