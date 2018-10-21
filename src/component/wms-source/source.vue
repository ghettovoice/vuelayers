<script>
  import TileWMSSource from 'ol/source/tilewms'
  import tileSource from '../../mixin/tile-source'
  import { WMS_VERSION } from '../../ol-ext/consts'
  import { hasSource, hasView } from '../../util/assert'
  import { reduce } from '../../util/minilo'

  const props = {
    extParams: Object, // Additional WMS Request params
    gutter: Number,
    hidpi: Boolean,
    layers: {
      type: String,
      required: true,
    },
    serverType: String,
    styles: String, // WMS Request styles
    version: {
      type: String,
      default: WMS_VERSION,
    },
    url: {
      type: String,
      required: true,
    },
  }

  const cleanExtParams = params => reduce(params, (cleanedParams, value, key) => {
    key = key.toUpperCase()
    if (['LAYERS', 'VERSION', 'STYLES'].includes(key)) {
      return cleanedParams
    }
    cleanedParams[key] = value
    return cleanedParams
  }, {})

  const computed = {
    preparedExtParams () {
      return this.extParams ? cleanExtParams(this.extParams) : undefined
    },
  }

  const methods = {
    /**
     * @returns {ol.source.TileWMS}
     * @protected
     */
    createSource () {
      return new TileWMSSource({
        attributions: this.attributions,
        cacheSize: this.cacheSize,
        params: {
          ...this.preparedExtParams,
          LAYERS: this.layers,
          STYLES: this.styles,
          VERSION: this.version,
        },
        crossOrigin: this.crossOrigin,
        gutter: this.gutter,
        hidpi: this.hidpi,
        logo: this.logo,
        tileGrid: this._tileGrid,
        projection: this.projection,
        reprojectionErrorThreshold: this.reprojectionErrorThreshold,
        serverType: this.serverType,
        wrapX: this.wrapX,
        url: this.urlTmpl,
        transition: this.transition,
        tileLoadFunction: this.tileLoadFunction,
      })
    },
    /**
     * @param {number[]} coordinate
     * @param {number} [resolution]
     * @param {string} [projection]
     * @param {Object} [params] GetFeatureInfo params. `info_format` at least should be provided.
     *                          If `query_layers` is not provided then the layers specified in the `layers` prop will be used.
     *                          `version` should not be specified here (value from `version` prop will be used).
     * @return {string|undefined}
     */
    getFeatureInfoUrl (
      coordinate,
      resolution,
      projection,
      params = {}
    ) {
      hasView(this)
      hasSource(this)

      resolution || (resolution = this.$view.getResolution())
      projection || (projection = this.projection)

      return this.$source.getFeatureInfoUrl(
        coordinate,
        resolution,
        projection,
        this.preparedExtParams
      )
    },
  }

  const watch = {
    layers (LAYERS) {
      this.$source && this.$source.updateParams({ LAYERS })
    },
    version (VERSION) {
      this.$source && this.$source.updateParams({ VERSION })
    },
    styles (STYLES) {
      this.$source && this.$source.updateParams({ STYLES })
    },
    extParams (value) {
      this.$source && this.$source.updateParams(this.preparedExtParams)
    },
  }

  export default {
    name: 'vl-source-wms',
    mixins: [tileSource],
    props,
    computed,
    methods,
    watch,
  }
</script>
