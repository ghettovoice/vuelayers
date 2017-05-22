<script>
  import VectorLayer from 'ol/layer/vector'
  import mergeDescriptors from '../../../utils/multi-merge-descriptors'
  import { SERVICE_CONTAINER_KEY } from '../../../consts'
  import layer from '../layer'
  import styleTarget from '../../style-target'

  const props = {
    updateWhileAnimating: Boolean,
    updateWhileInteracting: Boolean
    // todo implement options
    // renderOrder: Function,
    // renderBuffer: Number
  }

  const methods = {
    // protected & private
    /**
     * @return {ol.layer.Vector}
     * @protected
     */
    createLayer () {
      return new VectorLayer({
        id: this.id,
        minResolution: this.minResolution,
        maxResolution: this.maxResolution,
        opacity: this.opacity,
        visible: this.visible,
        preload: this.preload,
        extent: this.currentExtent,
        zIndex: this.zIndex,
        updateWhileAnimating: this.updateWhileAnimating,
        updateWhileInteracting: this.updateWhileInteracting
      })
    },
    /**
     * @return {ol.layer.Vector}
     * @protected
     */
    getStyleTarget () {
      return this.layer
    }
  }

  export default {
    name: 'vl-layer-vector',
    mixins: [layer, styleTarget],
    props,
    methods,
    provide () {
      return {
        [SERVICE_CONTAINER_KEY]: mergeDescriptors(
          {},
          this::layer.provide()[SERVICE_CONTAINER_KEY],
          this::styleTarget.provide()[SERVICE_CONTAINER_KEY]
        )
      }
    }
  }
</script>
