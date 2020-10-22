<script>
  import { Group as GroupLayer } from 'ol/layer'
  import { baseLayer, layersContainer } from '../../mixins'
  import { getLayerId } from '../../ol-ext'
  import { isEqual, map, mergeDescriptors } from '../../utils'

  export default {
    name: 'VlLayerGroup',
    mixins: [
      layersContainer,
      baseLayer,
    ],
    computed: {
      layers () {
        if (!this.rev) return []

        return map(this.getLayers(), layer => ({
          id: getLayerId(layer),
          type: layer.constructor.name,
        }))
      },
    },
    watch: {
      layers: {
        deep: true,
        handler (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:layers', value.slice())
        },
      },
    },
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
      subscribeAll () {
        this::layersContainer.methods.subscribeAll()
        this::baseLayer.methods.subscribeAll()
      },
    },
  }
</script>
