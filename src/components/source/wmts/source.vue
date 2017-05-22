<script>
  import WMTSSource from 'ol/source/wmts'
  import WMTSTileGrid from 'ol/tilegrid/wmts'
  import { range } from 'lodash/fp'
  import { consts, tileGridHelper } from '../../../ol-ext'
  import tileSource from '../tile'

  const { WMTS_VERSION, WMTS_REQUEST_ENCODING, WMTS_FORMAT } = consts

  const props = {
    dimensions: Object,
    format: {
      type: String,
      default: WMTS_FORMAT
    },
    layerName: {
      type: String,
      required: true
    },
    matrixSet: {
      type: String,
      required: true
    },
    requestEncoding: {
      type: String,
      default: WMTS_REQUEST_ENCODING
    },
    styleName: {
      type: String,
      required: true
    },
    version: {
      type: String,
      default: WMTS_VERSION
    }
  }

  const computed = {
    /**
     * @type {Object}
     */
    preparedGridOpts () {
      const resolutions = tileGridHelper.resolutionsFromExtent(
        this.projectionExtent,
        this.maxZoom,
        this.tileSize
      )

      return {
        resolutions,
        minZoom: this.minZoom,
        extent: this.projectionExtent,
        matrixIds: range(this.minZoom, resolutions.length),
        ...this.gridOpts
      }
    }
  }

  const methods = {
    // protected & private
    /**
     * @return {ol.tilegrid.WMTS}
     * @protected
     */
    createTileGrid () {
      return new WMTSTileGrid(this.preparedGridOpts)
    },
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
        tileGrid: this.tileGrid,
        tilePixelRatio: this.tilePixelRatio,
        style: this.styleName,
        version: this.version,
        url: this.urlTmpl,
        wrapX: this.wrapX
      })
    }
  }

  export default {
    name: 'vl-source-wmts',
    mixins: [tileSource],
    props,
    computed,
    methods
  }
</script>
