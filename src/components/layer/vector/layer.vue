<script>
  import VectorLayer from 'ol/layer/vector'
  import layer from '../layer'
  import styleContainer from '../../styles-container'

  const props = {
    updateWhileAnimating: Boolean,
    updateWhileInteracting: Boolean
    // todo implement options
    // renderOrder: Function,
    // renderBuffer: Number
  }

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
        source: this._source
      })
    },
    /**
     * @return {ol.layer.Vector|undefined}
     * @protected
     */
    getStyleTarget () {
      return this.$layer
    }
  }

  export default {
    name: 'vl-layer-vector',
    mixins: [layer, styleTarget],
    props,
    methods
  }
</script>
