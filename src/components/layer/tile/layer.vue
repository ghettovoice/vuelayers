<script>
  import TileLayer from 'ol/layer/tile'
  import layer from '../layer'

  const props = {
    preload: Number
  }

  const methods = {
    // protected & private
    /**
     * @return {ol.layer.Tile}
     * @protected
     */
    createLayer () {
      return new TileLayer({
        id: this.id,
        minResolution: this.minResolution,
        maxResolution: this.maxResolution,
        opacity: this.opacity,
        visible: this.visible,
        preload: this.preload,
        extent: this.extent,
        zIndex: this.zIndex
      })
    }
  }

  export default {
    name: 'vl-layer-tile',
    mixins: [layer],
    props,
    methods
  }
</script>
