<script>
  import VectorLayer from 'ol/layer/Vector'
  import vectorLayer from '../../mixin/vector-layer'

  const RENDER_MODES = ['vector', 'image']

  /**
   * @vueProps
   */
  const props = {
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
      validator: val => RENDER_MODES.includes(val),
    },
  }

  /**
   * @vueMethods
   */
  const methods = {
    /**
     * @return {Vector}
     * @protected
     */
    createLayer () {
      return new VectorLayer({
        id: this.id,
        minResolution: this.minResolution,
        maxResolution: this.maxResolution,
        opacity: this.opacity,
        visible: this.visible,
        extent: this.extent,
        zIndex: this.zIndex,
        updateWhileAnimating: this.updateWhileAnimating,
        updateWhileInteracting: this.updateWhileInteracting,
        source: this._source,
        renderMode: this.renderMode,
        renderBuffer: this.renderBuffer,
        renderOrder: this.renderOrder,
        declutter: this.declutter,
      })
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
    mixins: [vectorLayer],
    props,
    methods,
  }
</script>
