import WMSServerType from 'ol/source/WMSServerType'
import { cleanSourceParams } from '../ol-ext'
import { isArray, isEqual } from '../util/minilo'
import { makeWatchers } from '../util/vue-helpers'

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
    async allParams (value) {
      await this.updateParams(value)
    },
    async layersStr (value) {
      await this.updateParam('layers', value)
    },
    async stylesStr (value) {
      await this.updateParam('styles', value)
    },
    ...makeWatchers([
      'version',
      'transparent',
      'format',
      'bgColor',
      'time',
    ], prop => async function (value) {
      await this.updateParam(prop, value)
    }),
    ...makeWatchers([
      'hidpi',
      'serverType',
    ], prop => async function () {
      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log(`${prop} changed, scheduling recreate...`)
      }

      await this.scheduleRecreate()
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
      resolution || (resolution = this.$view && this.$view.getResolution())
      projection || (projection = this.projection)

      return (await this.resolveSource()).getFeatureInfoUrl(coordinate, resolution, projection, params)
    },
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
      const source = await this.resolveSource()

      if (isEqual(params, source.getParams())) return

      source.updateParams(params)
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
