import WMSServerType from 'ol/source/WMSServerType'
import { cleanSourceParams } from '../ol-ext'
import { isArray, isEqual, makeWatchers } from '../utils'
import sequential from '../utils/sequential'

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
     * @type {string|string[]}
     */
    layers: {
      type: String,
      required: true,
    },
    /**
     * WMS Request styles
     * @type {string|string[]|undefined}
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
     * @returns {string}
     */
    layersStr () {
      return isArray(this.layers) ? this.layers.join(',') : this.layers
    },
    /**
     * @returns {string|undefined}
     */
    stylesStr () {
      return isArray(this.styles) ? this.styles.join(',') : this.styles
    },
    /**
     * @returns {Object|null}
     */
    customParams () {
      return this.params ? cleanSourceParams(this.params, [
        'LAYERS',
        'VERSION',
        'STYLES',
        'FORMAT',
        'TRANSPARENT',
        'BGCOLOR',
        'TIME',
      ]) : null
    },
    /**
     * @returns {Object}
     */
    allParams () {
      return {
        ...this.customParams || {},
        LAYERS: this.layersStr,
        STYLES: this.stylesStr,
        VERSION: this.version,
        FORMAT: this.format,
        TRANSPARENT: this.transparent,
        BGCOLOR: this.bgColor,
        TIME: this.time,
      }
    },
  },
  watch: {
    allParams: /*#__PURE__*/sequential(async function (value) {
      await this.updateParams(value)
    }),
    layersStr: /*#__PURE__*/sequential(async function (value) {
      await this.updateParam('layers', value)
    }),
    stylesStr: /*#__PURE__*/sequential(async function (value) {
      await this.updateParam('styles', value)
    }),
    .../*#__PURE__*/makeWatchers([
      'version',
      'transparent',
      'format',
      'bgColor',
      'time',
    ], prop => /*#__PURE__*/sequential(async function (value) {
      await this.updateParam(prop, value)
    })),
    .../*#__PURE__*/makeWatchers([
      'hidpi',
      'serverType',
    ], prop => /*#__PURE__*/sequential(async function (val, prev) {
      if (isEqual(val, prev)) return

      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log(`${prop} changed, scheduling recreate...`)
      }

      await this.scheduleRecreate()
    })),
  },
  methods: {
    /**
     * @param {number[]} coordinate
     * @param {number} [resolution]
     * @param {string} [projection]
     * @param {Object|undefined} [params] GetFeatureInfo params. `info_format` at least should be provided.
     *                          If `query_layers` is not provided then the layers specified in the `layers` prop will be used.
     *                          `version` should not be specified here (value from `version` prop will be used).
     * @return {Promise<string|undefined>}
     */
    async getFeatureInfoUrl (coordinate, resolution, projection, params = {}) {
      resolution || (resolution = await this.$viewVm.getResolution())
      projection || (projection = this.projection)

      return (await this.resolveSource()).getFeatureInfoUrl(coordinate, resolution, projection, params)
    },
    /**
     * @param {number} resolution
     * @param {Object|undefined} [params]
     * @return {Promise<string|undefined>}
     */
    async getLegendUrl (resolution, params = {}) {
      return (await this.resolveSource()).getLegendUrl(resolution, params)
    },
    /**
     * @returns {Promise<Object>}
     */
    async getParams () {
      return (await this.resolveSource()).getParams()
    },
    /**
     * @param {Object} params
     * @returns {Promise<void>}
     */
    async updateParams (params) {
      params = { ...this.allParams, ...params }
      if (isEqual(params, await this.getParams())) return

      (await this.resolveSource()).updateParams(params)
    },
    /**
     * @param {string} param
     * @param {*} value
     * @returns {Promise<void>}
     */
    async updateParam (param, value) {
      await this.updateParams({ [param.toUpperCase()]: value })
    },
  },
}
