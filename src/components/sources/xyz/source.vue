<script>
  import ol from 'openlayers'
  import tileSource from 'vuelayers/src/mixins/tile-source'

  const methods = {
    createSource () {
      return new ol.source.XYZ({
        attributions: this.attributions,
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
    mixins: [ tileSource ],
    methods
  }
</script>

<style>
  /* stub style  */
</style>
