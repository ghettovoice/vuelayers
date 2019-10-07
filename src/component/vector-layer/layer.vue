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
    methods: {
      /**
       * @return {module:ol/layer/Vector~VectorLayer}
       * @protected
       */
      createLayer () {
        return new VectorLayer({
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
          renderOrder: this.renderOrder,
          renderBuffer: this.renderBuffer,
          declutter: this.declutter,
          updateWhileAnimating: this.updateWhileAnimating,
          updateWhileInteracting: this.updateWhileInteracting,
          source: this.$source,
        })
      },
    },
  }
</script>
