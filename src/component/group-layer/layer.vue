<script>
  import GroupLayer from 'ol/layer/Group'
  import { layer, layersContainer } from '../../mixin'
  import { IndexedCollectionAdapter } from '../../ol-ext'
  import { hasLayer } from '../../util/assert'
  import mergeDescriptors from '../../util/multi-merge-descriptors'

  const methods = {
    createLayer () {
      return new GroupLayer({
        id: this.id,
        minResolution: this.minResolution,
        maxResolution: this.maxResolution,
        opacity: this.opacity,
        visible: this.visible,
        extent: this.extent,
        zIndex: this.zIndex,
      })
    },
    getLayersTarget () {
      hasLayer(this)

      if (this._layersTarget == null) {
        this._layersTarget = new IndexedCollectionAdapter(
          this.$layer.getLayers(),
          layer => layer.get('id'),
        )
      }

      return this._layersTarget
    },
    getServices () {
      return mergeDescriptors(
        this::layer.methods.getServices(),
        this::layersContainer.methods.getServices()
      )
    },
  }

  export default {
    name: 'vl-layer-group',
    mixins: [layer, layersContainer],
    methods,
  }
</script>
