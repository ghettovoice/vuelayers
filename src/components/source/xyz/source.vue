<script>
  import { createTileUrlFunction } from 'ol-tilecache'
  import XYZSource from 'ol/source/xyz'
  import tileSource from '../tile'

  const props = {}

  const computed = {}

  const methods = {
    createSource () {
      return new XYZSource({
        attributions: this.currentAttributions,
        tileUrlFunction: this.createTileUrlFunction(this.tileGrid),
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
    },
    /**
     * @param {ol.tilegrid.TileGrid} tileGrid
     * @return {ol.TileUrlFunction}
     * @protected
     */
    createTileUrlFunction (tileGrid) {
      return createTileUrlFunction(this.currentUrl, tileGrid, this.currentProjectionExtent)
    }
  }

  // watch only url changes, other settings (like tileGrid) can't be changed at runtime
  const watch = {
    currentUrl () {
      this.source.setTileUrlFunction(this.createTileUrlFunction(this.tileGrid))
    }
  }

  export default {
    name: 'vl-source-xyz',
    mixins: [ tileSource ],
    props,
    computed,
    methods,
    watch
  }
</script>
