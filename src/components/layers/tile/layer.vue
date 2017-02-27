<script>
  import ol from 'openlayers'
  import layer from 'vuelayers/src/mixins/layer'

  const props = {
    preload: Number
  }

  const methods = {
    createLayer () {
      return new ol.layer.Tile({
        minResolution: this.minResolution,
        maxResolution: this.maxResolution,
        opacity: this.opacity,
        visible: this.visible,
        preload: this.preload
      })
    }
  }

  export default {
    name: 'vl-tile-layer',
    mixins: [ layer ],
    props,
    methods
  }
</script>

<style>
  /* stub style  */
</style>
