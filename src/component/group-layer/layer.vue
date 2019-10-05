<script>
  import { Group as GroupLayer } from 'ol/layer'
  import { layer, layersContainer } from '../../mixin'
  import mergeDescriptors from '../../util/multi-merge-descriptors'

  export default {
    name: 'VlLayerGroup',
    mixins: [layer, layersContainer],
    methods: {
      createLayer () {
        return new GroupLayer({
          id: this.id,
          minResolution: this.minResolution,
          maxResolution: this.maxResolution,
          opacity: this.opacity,
          visible: this.visible,
          extent: this.extent,
          zIndex: this.zIndex,
          layers: this._layersCollection,
        })
      },
      getServices () {
        return mergeDescriptors(
          this::layer.methods.getServices(),
          this::layersContainer.methods.getServices()
        )
      },
    },
  }
</script>
