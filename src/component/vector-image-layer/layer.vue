<script>
  import { VectorImage as VectorImageLayer } from 'ol/layer'
  import { vectorLayer } from '../../mixin'

  /**
   * Layer for data that is rendered client-side.
   */
  export default {
    name: 'VlLayerVectorImage',
    mixins: [
      vectorLayer,
    ],
    props: {
      // ol/layer/VectorImage
      /**
       * @type {number}
       */
      imageRatio: {
        type: Number,
        default: 1,
      },
    },
    watch: {
      async imageRatio (value) {
        if (value === await this.getImageRatio()) return

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('imageRatio changed, scheduling recreate...')
        }

        await this.scheduleRecreate()
      },
    },
    methods: {
      /**
       * @return {VectorImageLayer}
       * @protected
       */
      createLayer () {
        return new VectorImageLayer({
          // ol/layer/Base
          className: this.className,
          opacity: this.currentOpacity,
          visible: this.currentVisible,
          extent: this.currentExtentDataProj,
          zIndex: this.currentZIndex,
          minResolution: this.currentMinResolution,
          maxResolution: this.currentMaxResolution,
          minZoom: this.currentMinZoom,
          maxZoom: this.currentMaxZoom,
          // ol/layer/Layer
          render: this.render,
          source: this.$source,
          // ol/layer/BaseVector
          renderOrder: this.currentRenderOrder,
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
