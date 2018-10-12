<script>
  import VectorTileLayer from 'ol/layer/VectorTile'
  import vectorLayer from '../../mixin/vector-layer'

  const RENDER_MODES = ['vector', 'image', 'hybrid']

  const props = {
    renderMode: {
      type: String,
      default: 'hybrid',
      validator: val => RENDER_MODES.includes(val),
    },
    preload: {
      type: Number,
      default: 0,
    },
  }

  const methods = {
    /**
     * @return {VectorTileLayer}
     * @protected
     */
    createLayer () {
      return new VectorTileLayer({
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
        renderBuffer: this.renderBuffer,
        renderOrder: this.renderOrder,
        declutter: this.declutter,
      })
    },
  }

  export default {
    name: 'vl-layer-vector-tile',
    mixins: [vectorLayer],
    props,
    methods,
  }
</script>
