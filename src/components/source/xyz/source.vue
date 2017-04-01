<script>
  import XYZSource from 'ol/source/xyz'
  import tileSource from '../tile'

  const methods = {
    createSource () {
      return new XYZSource({
        attributions: this.currentAttributions,
        tileUrlFunction: this.createTileUrlFunction(),
        crossOrigin: this.crossOrigin,
        projection: this.currentProjection,
        tileGrid: this.tileGrid,
        tilePixelRatio: this.currentTilePixelRatio,
        minZoom: this.currentMinZoom,
        maxZoom: this.currentMaxZoom,
        wrapX: this.wrapX,
        opaque: this.opaque,
        cacheSize: this.cacheSize,
        reprojectionErrorThreshold: this.reprojectionErrorThreshold
      })
    }
  }

  export default {
    name: 'vl-source-xyz',
    mixins: [ tileSource ],
    methods
  }
</script>
