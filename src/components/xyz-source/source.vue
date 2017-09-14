<script>
  import { createTileUrlFunction } from 'ol-tilecache'
  import XYZSource from 'ol/source/xyz'
  import { ol as vlol, mixins, utils } from '../../core'

  const { extent: extentHelper } = vlol
  const { assert } = utils
  const { tileSource } = mixins

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
        tileGrid: this._tileGrid,
        tilePixelRatio: this.tilePixelRatio,
        tileUrlFunction: this.createTileUrlFunction(),
        wrapX: this.wrapX,
      })
    },
    /**
     * @return {ol.TileUrlFunction}
     * @protected
     */
    createTileUrlFunction () {
      assert.hasView(this)

      return createTileUrlFunction(
        this.urlTmpl,
        this._tileGrid,
        extentHelper.fromProjection(this.$view.getProjection())
      )
    },
  }

  // watch only url changes, other settings (like tileGrid) can't be changed at runtime
  const watch = {
    urlTmpl () {
      this.$source && this.$source.setTileUrlFunction(this.createTileUrlFunction())
    },
  }

  export default {
    name: 'vl-source-xyz',
    mixins: [tileSource],
    props,
    methods,
    watch,
  }
</script>
