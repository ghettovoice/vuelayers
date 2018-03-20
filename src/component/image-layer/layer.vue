<script>
  /** @module image-layer/layer */
  import ImageLayer from 'ol/layer/image'
  import layer from '../../mixin/layer'

  /**
   * @vueProps
   */
  const props = /** @lends module:image-layer/layer# */{}

  /**
   * @vueMethods
   */
  const methods = /** @lends module:image-layer/layer# */{
    /**
     * @return {ol.layer.Image}
     * @protected
     */
    createLayer () {
      return new ImageLayer({
        id: this.id,
        minResolution: this.minResolution,
        maxResolution: this.maxResolution,
        opacity: this.opacity,
        visible: this.visible,
        extent: this.extent,
        zIndex: this.zIndex,
        source: this._source,
      })
    },
  }

  /**
   * Layer for server-rendered images that are available for arbitrary extents and resolutions.
   *
   * @title vl-layer-image
   * @alias module:image-layer/layer
   * @vueProto
   *
   * @vueSlot default Default slot for `vl-source-*` (image-like only) components.
   */
  export default {
    name: 'vl-layer-createImageStyle',
    mixins: [layer],
    props,
    methods,
  }
</script>
