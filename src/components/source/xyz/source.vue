<script>
  import { createTileUrlFunction } from 'ol-tilecache'
  import XYZSource from 'ol/source/xyz'
  import { extent as extentHelper } from '../../../ol-ext'
  import tileSource from '../tile'
  import * as assert from '../../../utils/assert'

  const props = {}

  const methods = {
    /**
     * @return {ol.source.XYZ}
     * @protected
     */
    createSource () {
      return new XYZSource({
        attributions: this.attributions,
        cacheSize: this.cacheSize,
        crossOrigin: this.crossOrigin,
        maxZoom: this.maxZoom,
        minZoom: this.minZoom,
        opaque: this.opaque,
        projection: this.projection,
        reprojectionErrorThreshold: this.reprojectionErrorThreshold,
        tileGrid: this.tileGrid,
        tilePixelRatio: this.tilePixelRatio,
        tileUrlFunction: this.createTileUrlFunction(),
        wrapX: this.wrapX
      })
    },
    /**
     * @return {ol.TileUrlFunction}
     * @protected
     */
    createTileUrlFunction () {
      assert.hasMap(this)

      return createTileUrlFunction(
        this.urlTmpl,
        this.tileGrid,
        extentHelper.fromProjection(this.map.getView().getProjection())
      )
    }
  }

  // watch only url changes, other settings (like tileGrid) can't be changed at runtime
  const watch = {
    urlTmpl () {
      this.source && this.source.setTileUrlFunction(this.createTileUrlFunction())
    }
  }

  export default {
    name: 'vl-source-xyz',
    mixins: [tileSource],
    props,
    methods,
    watch
  }
</script>
