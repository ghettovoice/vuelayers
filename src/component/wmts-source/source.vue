<script>
  /**
   * @module wmts-source/source
   */
  import WMTSSource from 'ol/source/wmts'
  import WMTSTileGrid from 'ol/tilegrid/wmts'
  import { range } from '../../util/minilo'
  import tileSource from '../../mixin/tile-source'
  import { WMTS_FORMAT, WMTS_REQUEST_ENCODING, WMTS_VERSION } from '../../ol-ext/consts'
  import { createExtentFromProjection } from '../../ol-ext/extent'
  import { resolutionsFromExtent } from '../../ol-ext/tile-grid'
  import { hasView } from '../../util/assert'

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
      hasView(this)

      const extent = createExtentFromProjection(this.$view.getProjection())
      const resolutions = resolutionsFromExtent(
        extent,
        this.maxZoom,
        this.tileSize
      )

      return new WMTSTileGrid({
        extent,
        resolutions,
        tileSize: this.tileSize,
        minZoom: this.minZoom,
        matrixIds: Array.from(range(this.minZoom, resolutions.length)),
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
