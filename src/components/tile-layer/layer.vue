<script>
  import { Tile as TileLayer } from 'ol/layer'
  import { tileLayer } from '../../mixins'

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
          opacity: this.currentOpacity,
          visible: this.currentVisible,
          extent: this.currentExtentViewProj,
          zIndex: this.currentZIndex,
          minResolution: this.currentMinResolution,
          maxResolution: this.currentMaxResolution,
          minZoom: this.currentMinZoom,
          maxZoom: this.currentMaxZoom,
          // ol/layer/Layer
          render: this.render,
          source: this.$source,
          // ol/layer/BaseTile
          preload: this.currentPreload,
          useInterimTilesOnError: this.currentUseInterimTilesOnError,
        })
      },
    },
  }
</script>
