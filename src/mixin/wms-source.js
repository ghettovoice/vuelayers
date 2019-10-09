import { hasSource, hasView } from '../util/assert'
import { reduce } from '../util/minilo'
import { makeWatchers } from '../util/vue-helpers'

const cleanParams = params => reduce(params, (params, value, key) => {
  const filterKeys = [
    'LAYERS',
    'VERSION',
    'STYLES',
    'FORMAT',
    'TRANSPARENT',
    'BGCOLOR',
    'TIME',
  ]

  key = key.toUpperCase()
  if (filterKeys.includes(key)) {
    return params
  }

  params[key] = value

  return params
}, {})

export default {
  props: {
    hidpi: {
      type: Boolean,
      default: true,
    },
    serverType: {
      type: String,
      validator: value => value == null || Object.values(WMSServerType).includes(value),
    },
    layers: {
      type: String,
      required: true,
    },
    styles: String, // WMS Request styles
    version: {
      type: String,
      default: '1.3.0',
    },
    transparent: {
      type: Boolean,
      default: true,
    },
    format: {
      type: String,
      default: 'image/png',
    },
    bgColor: String,
    time: String,
    /**
     * Additional WMS request parameters
     */
    params: Object,
  },
  computed: {
    customParams () {
      return this.params ? cleanParams(this.params) : undefined
    },
    allParams () {
      return {
        ...this.customParams,
        LAYERS: this.layers,
        STYLES: this.styles,
        VERSION: this.version,
        FORMAT: this.format,
        TRANSPARENT: this.transparent,
        BGCOLOR: this.bgColor,
        TIME: this.time,
      }
    },
  },
  watch: {
    ...makeWatchers([
      'layers',
      'version',
      'styles',
      'transparent',
      'format',
      'bgColor',
      'time',
    ], prop => function (value) {
      prop = prop.toUpperCase()
      this.$source && this.$source.updateParams({ [prop]: value })
    }),
    params (value) {
      this.$source && this.$source.updateParams(value ? cleanParams(value) : undefined)
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
      params = { ...this.allParams, ...params }

      return this.$source.getGetFeatureInfoUrl(
        coordinate,
        resolution,
        projection,
        params,
      )
    },
  },
}
