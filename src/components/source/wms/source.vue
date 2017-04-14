<script>
  import TileWMSSource from 'ol/source/tilewms'
  import { omit } from 'lodash/fp'
  import { consts, coordinateHelper } from '../../../ol-ext'
  import tileSource from '../tile'

  const { WMS_VERSION } = consts
  const { toLonLat } = coordinateHelper

  const props = {
    layers: {
      type: String,
      required: true
    },
    version: {
      type: String,
      default: WMS_VERSION
    },
    styles: String, // WMS Request styles
    extParams: Object, // Additional WMS Request params
    gutter: Number,
    hidpi: Boolean,
    serverType: String
  }

  const computed = {
    currentLayers () {
      return this.layers
    },
    currentVersion () {
      return this.version
    },
    currentStyles () {
      return this.styles
    },
    currentServerType () {
      return this.serverType
    },
    currentExtParams () {
      return this.extParams
    }
  }

  const upperCase = x => x.toUpperCase()
  const keysToUpperCase = x => Object.keys(x).map(upperCase)
  const cleanExtParams = params => omit([ 'LAYERS', 'VERSION', 'STYLES' ], keysToUpperCase(params))

  const methods = {
    createSource () {
      return new TileWMSSource({
        attributions: this.currentAttributions,
        cacheSize: this.cacheSize,
        params: {
          ...cleanExtParams(this.currentExtParams),
          LAYERS: this.currentLayers,
          STYLES: this.currentStyles,
          VERSION: this.currentVersion
        },
        crossOrigin: this.crossOrigin,
        gutter: this.gutter,
        hidpi: this.hidpi,
        logo: this.logo,
        tileGrid: this.tileGrid,
        projection: this.currentProjection,
        reprojectionErrorThreshold: this.reprojectionErrorThreshold,
        serverType: this.currentServerType,
        wrapX: this.wrapX,
        url: this.currentUrl
      })
    },
    /**
     * @param {number[]} coordinate Coordinate in EPSG:4326
     * @param {number} [resolution]
     * @param {string} [projection]
     * @param {Object} [params] GetFeatureInfo params. `info_format` at least should be provided.
     *                          If `query_layers` is not provided then the layers specified in the `layers` prop will be used.
     *                          `version` should not be specified here (value from `version` prop will be used).
     * @return {string|undefined}
     */
    getGetFeatureInfoUrl (
      coordinate,
      resolution = this.view.getResolution(),
      projection = this.currentProjection,
      params = {}
    ) {
      return this.source.getFeatureInfoUrl(
        toLonLat(coordinate, projection),
        resolution,
        projection,
        cleanExtParams(params)
      )
    }
  }

  const watch = {
    currentLayers (value) {
      this.source.updateParams({
        LAYERS: value
      })
    },
    currentVersion (value) {
      this.source.updateParams({
        VERSION: value
      })
    },
    currentStyles (value) {
      this.source.updateParams({
        STYLES: value
      })
    },
    currentExtParams (value) {
      this.source.updateParams(cleanExtParams(value))
    }
  }

  export default {
    name: 'vl-source-wms',
    mixins: [ tileSource ],
    props,
    computed,
    methods,
    watch
  }
</script>
