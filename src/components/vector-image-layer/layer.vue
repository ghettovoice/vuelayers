<script>
  import { VectorImage as VectorImageLayer } from 'ol/layer'
  import { makeChangeOrRecreateWatchers, vectorLayer } from '../../mixins'

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
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'imageRatio',
      ]),
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
          // ol/layer/VectorImage
          imageRatio: this.imageRatio,
        })
      },
    },
  }
</script>
