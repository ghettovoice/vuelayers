<script>
  import { Vector as VectorLayer } from 'ol/layer'
  import { vectorLayer } from '../../mixins'

  /**
   * Layer for data that is rendered client-side.
   */
  export default {
    name: 'VlLayerVector',
    mixins: [
      vectorLayer,
    ],
    props: {
      /**
       * @deprecated Use `vl-layer-vector-image` to render vector layer as image
       * @todo remove in v0.13.x
       */
      renderMode: String,
    },
    created () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.renderMode) {
          this.$logger.warn("'renderMode' is deprecated. Use vl-layer-vector-image to render vector layer as image")
        }
      }
    },
    updated () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.renderMode) {
          this.$logger.warn("'renderMode' is deprecated. Use vl-layer-vector-image to render vector layer as image")
        }
      }
    },
    methods: {
      /**
       * @return {module:ol/layer/Vector~VectorLayer}
       * @protected
       */
      createLayer () {
        return new VectorLayer({
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
          // ol/layer/BaseVector
          renderOrder: this.renderOrder,
          renderBuffer: this.renderBuffer,
          declutter: this.declutter,
          updateWhileAnimating: this.updateWhileAnimating,
          updateWhileInteracting: this.updateWhileInteracting,
          style: this.$style,
        })
      },
    },
  }
</script>
