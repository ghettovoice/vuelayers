<script>
  import { Image as ImageLayer } from 'ol/layer'
  import { imageLayer } from '../../mixins'

  /**
   * Layer for server-rendered images that are available for arbitrary extents and resolutions.
   */
  export default {
    name: 'VlLayerImage',
    mixins: [
      imageLayer,
    ],
    methods: {
      /**
       * @return {Image}
       * @protected
       */
      createLayer () {
        return new ImageLayer({
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
        })
      },
    },
  }
</script>
