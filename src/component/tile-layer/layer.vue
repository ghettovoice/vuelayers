<script>
  import { Tile as TileLayer } from 'ol/layer'
  import { tileLayer } from '../../mixin'

  /**
   * Layer that provide pre-rendered, tiled images in grid that are organized by zoom levels for
   * specific resolutions. `vl-tile-layer` component implements a **source container** interface, so it should be
   * used together with tile-like `vl-source-*` components.
   */
  export default {
    name: 'VlLayerTile',
    mixins: [
      tileLayer,
    ],
    methods: {
      /**
       * @return {Tile}
       * @protected
       */
      createLayer () {
        return new TileLayer({
          // ol/layer/Base
          className: this.className,
          opacity: this.opacity,
          visible: this.visible,
          extent: this.extent,
          zIndex: this.zIndex,
          minResolution: this.minResolution,
          maxResolution: this.maxResolution,
          minZoom: this.minZoom,
          maxZoom: this.maxZoom,
          source: this.$source,
          // ol/layer/Layer
          render: this.render,
          // ol/layer/BaseTile
          preload: this.preload,
          useInterimTilesOnError: this.useInterimTilesOnError,
        })
      },
    },
  }
</script>
