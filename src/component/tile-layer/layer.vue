<script>
  import TileLayer from 'ol/layer/Tile'
  import layer from '../../mixin/layer'

  /**
   * @vueProps
   */
  const props = /** @lends module:tile-layer/layer# */{
    /**
     * Load low-resolution tiles up to `preload` levels.
     * @type {number}
     * @default 0
     */
    preload: {
      type: Number,
      default: 0,
    },
  }

  /**
   * @vueMethods
   */
  const methods = /** @lends module:tile-layer/layer# */{
    /**
     * @return {Tile}
     * @protected
     */
    createLayer () {
      return new TileLayer({
        id: this.id,
        minResolution: this.minResolution,
        maxResolution: this.maxResolution,
        opacity: this.opacity,
        visible: this.visible,
        preload: this.preload,
        extent: this.extent,
        zIndex: this.zIndex,
        source: this._source,
      })
    },
  }

  /**
   * Layer that provide pre-rendered, tiled images in grid that are organized by zoom levels for
   * specific resolutions. `vl-tile-layer` component implements a **source container** interface, so it should be
   * used together with tile-like `vl-source-*` components.
   *
   * @title vl-layer-tile
   * @alias module:tile-layer/layer
   * @vueProto
   *
   * @vueSlot default Default slot for `vl-source-*` (tile-like only) components.
   */
  export default {
    name: 'vl-layer-tile',
    mixins: [layer],
    props,
    methods,
  }
</script>
