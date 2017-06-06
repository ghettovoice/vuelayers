<script>
  import TileWMSSource from 'ol/source/tilewms'
  import { omit } from 'lodash/fp'
  import { WMS_VERSION, proj } from '../../../ol-ext'
  import tileSource from '../tile'
  import { assertHasSource, assertHasMap } from '../../../utils/assert'

  const props = {
    extParams: Object, // Additional WMS Request params
    gutter: Number,
    hidpi: Boolean,
    layers: {
      type: String,
      required: true
    },
    serverType: String,
    styles: String, // WMS Request styles
    version: {
      type: String,
      default: WMS_VERSION
    }
  }

  const upperCase = x => x.toUpperCase()
  const keysToUpperCase = x => Object.keys(x).map(upperCase)
  const cleanExtParams = params => omit(['LAYERS', 'VERSION', 'STYLES'], keysToUpperCase(params))

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
          ...cleanExtParams(this.extParams),
          LAYERS: this.layers,
          STYLES: this.styles,
          VERSION: this.version
        },
        crossOrigin: this.crossOrigin,
        gutter: this.gutter,
        hidpi: this.hidpi,
        logo: this.logo,
        tileGrid: this.tileGrid,
        projection: this.projection,
        reprojectionErrorThreshold: this.reprojectionErrorThreshold,
        serverType: this.serverType,
        wrapX: this.wrapX,
        url: this.urlTmpl
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
      resolution,
      projection,
      params = {}
    ) {
      assertHasMap(this)
      assertHasSource(this)

      resolution || (resolution = this.map.view.getResolution())
      projection || (projection = this.projection)

      return this.source.getFeatureInfoUrl(
        proj.toLonLat(coordinate, projection),
        resolution,
        projection,
        cleanExtParams(params)
      )
    }
  }

  const watch = {
    layers (LAYERS) {
      assertHasSource(this)
      this.source.updateParams({ LAYERS })
    },
    version (VERSION) {
      assertHasSource(this)
      this.source.updateParams({ VERSION })
    },
    styles (STYLES) {
      assertHasSource(this)
      this.source.updateParams({ STYLES })
    },
    extParams (value) {
      assertHasSource(this)
      this.source.updateParams(cleanExtParams(value))
    }
  }

  export default {
    name: 'vl-source-wms',
    mixins: [tileSource],
    props,
    methods,
    watch
  }
</script>
