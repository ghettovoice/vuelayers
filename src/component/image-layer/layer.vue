<script>
  import { Image as ImageLayer } from 'ol/layer'
  import { layer } from '../../mixin'

  /**
   * Layer for server-rendered images that are available for arbitrary extents and resolutions.
   */
  export default {
    name: 'VlLayerImage',
    mixins: [
      layer,
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
        })
      },
    },
  }
</script>
