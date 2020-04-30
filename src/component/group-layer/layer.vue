<script>
  import { Group as GroupLayer } from 'ol/layer'
  import { layer, layersContainer } from '../../mixin'
  import mergeDescriptors from '../../util/multi-merge-descriptors'

  export default {
    name: 'VlLayerGroup',
    mixins: [
      layersContainer,
      layer,
    ],
    methods: {
      createLayer () {
        return new GroupLayer({
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
          // ol/layer/Layer
          render: this.render,
          // ol/layer/Group
          layers: this.$layersCollection,
        })
      },
      getServices () {
        return mergeDescriptors(
          this::layer.methods.getServices(),
          this::layersContainer.methods.getServices(),
        )
      },
    },
  }
</script>
