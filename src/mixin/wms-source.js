import { WMS_VERSION } from '../ol-ext'
import { hasSource, hasView } from '../util/assert'
import { reduce } from '../util/minilo'

const cleanExtParams = params => reduce(params, (params, value, key) => {
  key = key.toUpperCase()
  if (['LAYERS', 'VERSION', 'STYLES'].includes(key)) {
    return params
  }
  params[key] = value
  return params
}, {})

export default {
  props: {
    /**
     * Extra WMS request parameters
     */
    extParams: Object,
    layers: {
      type: String,
      required: true,
    },
    styles: String, // WMS Request styles
    version: {
      type: String,
      default: WMS_VERSION,
    },
  },
  computed: {
    cleanExtParams () {
      return this.extParams ? cleanExtParams(this.extParams) : undefined
    },
    allParams () {
      return {
        ...this.cleanExtParams,
        LAYERS: this.layers,
        STYLES: this.styles,
        VERSION: this.version,
      }
    },
  },
  methods: {
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
      params = {},
    ) {
      hasView(this)
      hasSource(this)

      resolution || (resolution = this.$view.getResolution())
      projection || (projection = this.projection)

      return this.$source.getFeatureInfoUrl(
        coordinate,
        resolution,
        projection,
        { ...this.cleanExtParams, ...params },
      )
    },
  },
  watch: {
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
      this.$source && this.$source.updateParams(this.cleanExtParams)
    },
  },
}
