<script>
  /** @module vector-layer/layer */
  import VectorLayer from 'ol/layer/vector'
  import { mergeDescriptors, layer, stylesContainer } from '../../core'

  /**
   * @vueProps
   */
  const props = {
    /**
     * When set to `true`, feature batches will be recreated during animations.
     * @type {boolean}
     * @default false
     */
    updateWhileAnimating: Boolean,
    /**
     * When set to `true`, feature batches will be recreated during interactions.
     * @type {boolean}
     * @default false
     */
    updateWhileInteracting: Boolean,
    /**
     * Render mode for vector layers. Available values:
     * - `image` - vector layers are rendered as images
     * - `vector` - vector layers are rendered as vectors
     * @type {string}
     * @default vector
     */
    renderMode: {
      type: String,
      default: 'vector',
    },
    // todo implement options
    // renderOrder: Function,
    // renderBuffer: Number
  }

  /**
   * @vueMethods
   */
  const methods = {
    /**
     * @return {ol.layer.Vector}
     * @protected
     */
    createLayer () {
      return new VectorLayer({
        id: this.id,
        minResolution: this.minResolution,
        maxResolution: this.maxResolution,
        opacity: this.opacity,
        visible: this.visible,
        preload: this.preload,
        extent: this.extent,
        zIndex: this.zIndex,
        updateWhileAnimating: this.updateWhileAnimating,
        updateWhileInteracting: this.updateWhileInteracting,
        source: this._source,
        renderMode: this.renderMode,
      })
    },
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      return mergeDescriptors(
        this::layer.methods.getServices(),
        this::stylesContainer.methods.getServices()
      )
    },
    /**
     * @return {ol.layer.Vector|undefined}
     * @protected
     */
    getStyleTarget () {
      return this.$layer
    },
  }

  /**
   * Layer for data that is rendered client-side.
   *
   * @vueProto
   * @title vl-layer-vector
   * @alias module:vector-layer/layer
   *
   * @vueSlot default Default slot for `vl-source-*` (vector-like only) components.
   */
  export default {
    name: 'vl-layer-vector',
    mixins: [layer, stylesContainer],
    props,
    methods,
  }
</script>
