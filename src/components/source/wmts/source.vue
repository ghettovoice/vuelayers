<script>
  import WMTSSource from 'ol/source/wmts'
  import WMTSTileGrid from 'ol/tilegrid/wmts'
  import { range } from 'lodash/fp'
  import { consts, tileGridHelper } from '../../../ol-ext'
  import tileSource from '../tile'

  const { WMTS_VERSION, WMTS_REQUEST_ENCODING, WMTS_FORMAT } = consts

  const props = {
    layerName: {
      type: String,
      required: true
    },
    styleName: {
      type: String,
      required: true
    },
    matrixSet: {
      type: String,
      required: true
    },
    version: {
      type: String,
      default: WMTS_VERSION
    },
    requestEncoding: {
      type: String,
      default: WMTS_REQUEST_ENCODING
    },
    format: {
      type: String,
      default: WMTS_FORMAT
    },
    dimensions: Object
  }

  const computed = {
    currentLayerName () {
      return this.layerName
    },
    currentVersion () {
      return this.version
    },
    currentStyleName () {
      return this.styleName
    },
    currentMatrixSet () {
      return this.matrixSet
    },
    currentRequestEncoding () {
      return this.requestEncoding
    },
    currentFormat () {
      return this.format
    },
    currentDimensions () {
      return this.dimensions
    },
    currentGridOpts () {
      const resolutions = tileGridHelper.resolutionsFromExtent(
        this.currentProjectionExtent,
        this.currentMaxZoom,
        this.currentTileSize
      )

      return {
        resolutions,
        minZoom: this.currentMinZoom,
        extent: this.currentProjectionExtent,
        matrixIds: range(this.currentMinZoom, resolutions.length),
        ...this.gridOpts
      }
    }
  }

  const methods = {
    /**
     * @return {ol.tilegrid.WMTS}
     */
    createTileGrid () {
      return new WMTSTileGrid(this.currentGridOpts)
    },
    createSource () {
      return new WMTSSource({
        attributions: this.currentAttributions,
        cacheSize: this.cacheSize,
        crossOrigin: this.crossOrigin,
        logo: this.logo,
        projection: this.currentProjection,
        reprojectionErrorThreshold: this.reprojectionErrorThreshold,
        requestEncoding: this.currentRequestEncoding,
        layer: this.currentLayerName,
        style: this.currentStyleName,
        tilePixelRatio: this.currentTilePixelRatio,
        tileGrid: this.tileGrid,
        version: this.currentVersion,
        format: this.currentFormat,
        matrixSet: this.currentMatrixSet,
        dimensions: this.currentDimensions,
        url: this.currentUrl,
        wrapX: this.wrapX
      })
    }
  }

  const watch = {}

  export default {
    name: 'vl-source-wmts',
    mixins: [ tileSource ],
    props,
    computed,
    methods,
    watch
  }
</script>
