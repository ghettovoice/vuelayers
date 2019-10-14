import WMSServerType from 'ol/source/WMSServerType'
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

/**
 * Basic WMS params and methods mixin.
 */
export default {
  props: {
    /**
     * @type {boolean}
     */
    hidpi: {
      type: Boolean,
      default: true,
    },
    /**
     * @type {string|undefined}
     */
    serverType: {
      type: String,
      validator: value => Object.values(WMSServerType).includes(value),
    },
    /**
     * @type {string}
     */
    layers: {
      type: String,
      required: true,
    },
    /**
     * WMS Request styles
     * @type {string|undefined}
     */
    styles: String,
    /**
     * @type {string}
     */
    version: {
      type: String,
      default: '1.3.0',
    },
    /**
     * @type {boolean}
     */
    transparent: {
      type: Boolean,
      default: true,
    },
    /**
     * @type {string}
     */
    format: {
      type: String,
      default: 'image/png',
    },
    /**
     * @type {string|undefined}
     */
    bgColor: String,
    /**
     * @type {string|undefined}
     */
    time: String,
    /**
     * Additional WMS request parameters
     * @type {Object|undefined}
     */
    params: Object,
  },
  computed: {
    /**
     * @returns {Object|null}
     */
    customParams () {
      return this.params ? cleanParams(this.params) : null
    },
    /**
     * @returns {Object}
     */
    allParams () {
      return {
        ...this.customParams || {},
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
    customParams (value) {
      this.updateSourceParams(value)
    },
    ...makeWatchers([
      'layers',
      'version',
      'styles',
      'transparent',
      'format',
      'bgColor',
      'time',
    ], prop => function (value) {
      this.updateSourceParam(prop, value)
    }),
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
    async getFeatureInfoUrl (coordinate, resolution, projection, params = {}) {
      hasView(this)
      hasSource(this)

      resolution || (resolution = this.$view.getResolution())
      projection || (projection = this.projection)
      params = { ...this.allParams, ...params }

      return (await this.resolveSource()).getFeatureInfoUrl(
        coordinate,
        resolution,
        projection,
        params,
      )
    },
    /**
     * @param {string} param
     * @param {*} value
     * @returns {Promise<void>}
     */
    async updateSourceParam (param, value) {
      (await this.resolveSource()).updateParams({ [param.toUpperCase()]: value })
    },
    /**
     * @param {Object} params
     * @returns {Promise<void>}
     */
    async updateSourceParams (params) {
      (await this.resolveSource()).updateParams()
    },
  },
}
