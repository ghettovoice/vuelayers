<script>
  import { VectorImage as VectorImageLayer } from 'ol/layer'
  import { makeWatchers } from '../../util/vue-helpers'
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
      imageRatio: {
        type: Number,
        default: 1,
      },
    },
    watch: {
      ...makeWatchers([
        'imageRatio',
      ], () => vectorLayer.methods.scheduleRecreate),
    },
    methods: {
      /**
       * @return {module:ol/layer/VectorImage~VectorImageLayer}
       * @protected
       */
      createLayer () {
        return new VectorImageLayer({
          // layer props
          id: this.id,
          className: this.className,
          opacity: this.opacity,
          visible: this.visible,
          extent: this.extent,
          zIndex: this.zIndex,
          minResolution: this.minResolution,
          maxResolution: this.maxResolution,
          minZoom: this.minZoom,
          maxZoom: this.maxZoom,
          render: this.render,
          // vector layer props
          renderOrder: this.renderOrder,
          renderBuffer: this.renderBuffer,
          declutter: this.declutter,
          updateWhileAnimating: this.updateWhileAnimating,
          updateWhileInteracting: this.updateWhileInteracting,
          // self props
          imageRatio: this.imageRatio,
        })
      },
      /**
       * @returns {Promise<number>}
       */
      async getLayerImageRatio () {
        return (await this.resolveLayer()).getImageRatio()
      },
    },
  }
</script>
