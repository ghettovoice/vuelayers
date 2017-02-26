<script>
  import ol from 'openlayers'
  import { createAttributions } from 'vuelayers/src/ol'
  import tileSource from 'vuelayers/src/mixins/tile-source'

  const methods = {
    createSource () {
      return new ol.source.XYZ({
        attributions: createAttributions(this.attributions),
        tileUrlFunction: this.createTileUrlFunction(),
        crossOrigin: this.crossOrigin,
        projection: this.projection,
        tileSize: this.tileSize,
        tilePixelRatio: this.tilePixelRatio,
        wrapX: this.wrapX
      })
    }
  }

  export default {
    name: 'vl-xyz-source',
    mixin: [ tileSource ],
    methods
  }
</script>
