<script>
  import WMTSSource from 'ol/source/WMTS'
  import WMTSTileGrid from 'ol/tilegrid/WMTS'
  import tileSource from '../../mixin/tile-source'
  import { EXTENT_CORNER, WMTS_FORMAT, WMTS_REQUEST_ENCODING, WMTS_VERSION } from '../../ol-ext/consts'
  import { createExtentFromProjection, getExtentCorner } from '../../ol-ext/extent'
  import { resolutionsFromExtent } from '../../ol-ext/tile-grid'
  import { hasView } from '../../util/assert'
  import { range } from '../../util/minilo'

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
    origin: {
      type: Array,
    },
    resolutions: {
      type: Array,
    },
  }

  const methods = {
    /**
     * @returns {WMTS}
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
        origin: this.origin,
        projection: this.projection,
        reprojectionErrorThreshold: this.reprojectionErrorThreshold,
        requestEncoding: this.requestEncoding,
        resolutions: this.resolutions,
        tileGrid: this._tileGrid,
        tilePixelRatio: this.tilePixelRatio,
        style: this.styleName,
        version: this.version,
        url: this.urlTmpl,
        wrapX: this.wrapX,
        transition: this.transition,
        tileLoadFunction: this.tileLoadFunction,
      })
    },
    /**
     * @return {WMTS}
     * @protected
     */
    createTileGrid () {
      hasView(this)

      var extent = createExtentFromProjection(this.$view.getProjection())
      var resolutions = this.resolutions ? this.resolutions : resolutionsFromExtent(extent, this.maxZoom, this.tileSize)
      var origin = this.origin ? this.origin : getExtentCorner(extent, EXTENT_CORNER.TOP_LEFT)

      return new WMTSTileGrid({
        extent: extent,
        origin: origin,
        resolutions: resolutions,
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
