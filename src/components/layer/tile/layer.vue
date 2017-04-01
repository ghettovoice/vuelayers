<script>
  import TileLayer from 'ol/layer/tile'
  import layer from '../layer'

  const props = {
    preload: Number
  }

  const methods = {
    /**
     * @return {TileLayer}
     */
    createLayer () {
      return new TileLayer({
        id: this.currentId,
        minResolution: this.currentMinResolution,
        maxResolution: this.currentMaxResolution,
        opacity: this.currentOpacity,
        visible: this.visible,
        preload: this.preload,
        extent: this.currentExtent,
        zIndex: this.zIndex
      })
    }
  }

  export default {
    name: 'vl-layer-tile',
    mixins: [ layer ],
    props,
    methods
  }
</script>
