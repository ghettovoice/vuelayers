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
      /**
       * @returns {Promise<number>}
       */
      async getImageRatio () {
        return (await this.resolveLayer()).getImageRatio()
      },
    },
  }
</script>
