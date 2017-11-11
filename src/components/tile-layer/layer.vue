<script>
  import TileLayer from 'ol/layer/tile'
  import { projHelper, layer } from '../../core'

  const props = {
    preload: Number,
  }

  const methods = {
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
        extent: this.extent
          ? projHelper.extentFromLonLat(this.extent, this.$view.getProjection())
          : undefined,
        zIndex: this.zIndex,
        source: this._source,
      })
    },
  }

  export default {
    name: 'vl-layer-tile',
    mixins: [layer],
    props,
    methods,
  }
</script>
