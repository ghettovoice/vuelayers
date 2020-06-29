<script>
  import { Group as GroupLayer } from 'ol/layer'
  import { baseLayer, layersContainer } from '../../mixin'
  import { mergeDescriptors } from '../../util'

  export default {
    name: 'VlLayerGroup',
    mixins: [
      layersContainer,
      baseLayer,
    ],
    methods: {
      createLayer () {
        return new GroupLayer({
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
          // ol/layer/Group
          layers: this.$layersCollection,
        })
      },
      getServices () {
        return mergeDescriptors(
          this::baseLayer.methods.getServices(),
          this::layersContainer.methods.getServices(),
        )
      },
    },
  }
</script>
