<script>
  import { Vector as VectorLayer } from 'ol/layer'
  import { vectorLayer } from '../../mixin'

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
          this.$logger.warn("'renderMode' is deprecated. Use vlLayerVectorImage to render vector layer as image")
        }
      }
    },
    updated () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.renderMode) {
          this.$logger.warn("'renderMode' is deprecated. Use vlLayerVectorImage to render vector layer as image")
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
          // ol/layer/BaseVector
          renderOrder: this.renderOrder,
          renderBuffer: this.renderBuffer,
          declutter: this.declutter,
          updateWhileAnimating: this.updateWhileAnimating,
          updateWhileInteracting: this.updateWhileInteracting,
          // ol/layer/VectorImage
          imageRatio: this.imageRatio,
        })
      },
    },
  }
</script>
