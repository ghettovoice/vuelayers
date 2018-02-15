<script>
  import WMTSSource from 'ol/source/wmts'
  import WMTSTileGrid from 'ol/tilegrid/wmts'
  import { range } from 'lodash/fp'
  import {
    WMTS_VERSION,
    WMTS_REQUEST_ENCODING,
    WMTS_FORMAT,
    tileGridHelper,
    extentHelper,
    assert,
    tileSource,
  } from '../../core'

  const props = {
    dimensions: Object,
    format: {
      type: String,
      default: WMTS_FORMAT,
    },
    layerName: {
      type: String,
      required: true,
    },
    matrixSet: {
      type: String,
      required: true,
    },
    requestEncoding: {
      type: String,
      default: WMTS_REQUEST_ENCODING,
    },
    styleName: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      default: WMTS_VERSION,
    },
    url: {
      type: String,
      required: true,
    },
  }

  const methods = {
    /**
     * @returns {ol.source.WMTS}
     * @protected
     */
    createSource () {
      return new WMTSSource({
        attributions: this.attributions,
        cacheSize: this.cacheSize,
        crossOrigin: this.crossOrigin,
        dimensions: this.dimensions,
        format: this.format,
        layer: this.layerName,
        logo: this.logo,
        matrixSet: this.matrixSet,
        projection: this.projection,
        reprojectionErrorThreshold: this.reprojectionErrorThreshold,
        requestEncoding: this.requestEncoding,
        tileGrid: this._tileGrid,
        tilePixelRatio: this.tilePixelRatio,
        style: this.styleName,
        version: this.version,
        url: this.urlTmpl,
        wrapX: this.wrapX,
      })
    },
    /**
     * @return {ol.tilegrid.WMTS}
     * @protected
     */
    createTileGrid () {
      assert.hasView(this)

      const extent = extentHelper.fromProjection(this.$view.getProjection())
      const resolutions = tileGridHelper.resolutionsFromExtent(
        extent,
        this.maxZoom,
        this.tileSize
      )

      return new WMTSTileGrid({
        extent,
        resolutions,
        tileSize: this.tileSize,
        minZoom: this.minZoom,
        matrixIds: range(this.minZoom, resolutions.length),
      })
    },
  }

  export default {
    name: 'vl-source-wmts',
    mixins: [tileSource],
    props,
    methods,
  }
</script>
