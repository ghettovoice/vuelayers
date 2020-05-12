import { cleanSourceParams } from '../ol-ext'
import { isArray, isEqual } from '../util/minilo'
import { makeWatchers } from '../util/vue-helpers'

const serialize = value => {
  if (value == null) return value

  return typeof value === 'object' ? JSON.stringify(value) : value
}

/**
 * Shared ArcGIS source params and methods.
 */
export default {
  props: {
    // ArcGIS params from https://developers.arcgis.com/rest/services-reference/export-map.htm
    /**
     * @type {boolean}
     */
    hidpi: {
      type: Boolean,
      default: true,
    },
    /**
     * @type {string}
     */
    format: {
      type: String,
      default: 'PNG32',
    },
    /**
     * @type {string|string[]|undefined}
     */
    layers: [String, Array],
    /**
     * @type {Object|string|undefined}
     */
    layerDefs: [Object, String],
    /**
     * @type {Object[]|string|undefined}
     */
    dynamicLayers: [Array, String],
    /**
     * @type {number|undefined}
     */
    dpi: Number,
    /**
     * @type {boolean}
     */
    transparent: {
      type: Boolean,
      default: true,
    },
    /**
     * @type {string|string[]|undefined}
     */
    time: [String, Array],
    /**
     * @type {Object|string|undefined}
     */
    layerTimeOptions: [Object, String],
    /**
     * @type {string|undefined}
     */
    gdbVersion: String,
    /**
     * @type {string|undefined}
     */
    mapScale: String,
    /**
     * @type {number|undefined}
     */
    rotation: Number,
    /**
     * @type {Array|string|undefined}
     */
    datumTransformations: [Array, String],
    /**
     * @type {Array|string|undefined}
     */
    mapRangeValues: [Array, String],
    /**
     * @type {Array|string|undefined}
     */
    layerRangeValues: [Array, String],
    /**
     * @type {Array|string|undefined}
     */
    layerParameterValues: [Array, String],
    /**
     * @type {number|undefined}
     */
    historicMoment: Number,
    /**
     * Additional ArcGIS request parameters
     * @params {Object|undefined}
     */
    params: Object,
  },
  computed: {
    /**
     * @returns {string|undefined}
     */
    layersStr () {
      return isArray(this.layers) ? this.layers.join(',') : this.layers
    },
    /**
     * @type {string|undefined}
     */
    timeStr () {
      return isArray(this.time) ? this.time.join(',') : this.time
    },
    /**
     * @returns {Object|null}
     */
    customParams () {
      return this.params ? cleanSourceParams(this.params, [
        'FORMAT',
        'F',
        'LAYERS',
        'LAYERDEFS',
        'DYNAMICLAYERS',
        'DPI',
        'TRANSPARENT',
        'TIME',
        'LAYERTIMEOPTIONS',
        'GDBVERSION',
        'MAPSCALE',
        'ROTATION',
        'DATUMTRANSFORMATIONS',
        'MAPRANGEVALUES',
        'LAYERRANGEVALUES',
        'LAYERPARAMETERVALUES',
        'HISTORICMOMENT',
      ]) : null
    },
    /**
     * @returns {Object}
     */
    allParams () {
      return {
        ...this.customParams || {},
        LAYERS: this.layersStr,
        FORMAT: this.format,
        LAYERDEFS: serialize(this.layerDefs),
        DYNAMICLAYERS: serialize(this.dynamicLayers),
        DPI: this.dpi,
        TRANSPARENT: this.transparent,
        TIME: this.timeStr,
        LAYERTIMEOPTIONS: serialize(this.layerTimeOptions),
        GDBVERSION: this.gdbVersion,
        MAPSCALE: this.mapScale,
        ROTATION: this.rotation,
        DATUMTRANSFORMATIONS: serialize(this.datumTransformations),
        MAPRANGEVALUES: serialize(this.mapRangeValues),
        LAYERRANGEVALUES: serialize(this.layerRangeValues),
        LAYERPARAMETERVALUES: serialize(this.layerParameterValues),
        HISTORICMOMENT: serialize(this.historicMoment),
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
    async timeStr (value) {
      await this.updateParam('time', value)
    },
    ...makeWatchers([
      'format',
      'layerDefs',
      'dynamicLayers',
      'dpi',
      'transparent',
      'layerTimeOptions',
      'gdbVersion',
      'mapScale',
      'rotation',
      'datumTransformations',
      'mapRangeValues',
      'layerRangeValues',
      'layerParameterValues',
      'historicMoment',
    ], prop => async function (value) {
      await this.updateParam(prop, serialize(value))
    }),
    ...makeWatchers([
      'hidpi',
    ], prop => async function () {
      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log(`${prop} changed, scheduling recreate...`)
      }

      await this.scheduleRecreate()
    }),
  },
  methods: {
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
