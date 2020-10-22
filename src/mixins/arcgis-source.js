import { cleanSourceParams } from '../ol-ext'
import {
  clonePlainObject,
  coalesce,
  hasProp,
  isArray,
  isEqual,
  lowerFirst,
  makeWatchers,
  reduce,
  upperFirst,
  isObjectLike,
} from '../utils'
import { makeChangeOrRecreateWatchers } from './ol-cmp'

const serialize = value => {
  if (value == null) return

  return typeof value === 'object' ? JSON.stringify(value) : value
}
const cleanArcGisSourceParams = params => cleanSourceParams(params, [
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
])

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
  data () {
    return {
      currentParams: undefined,
    }
  },
  computed: {
    /**
     * @returns {string|undefined}
     */
    inputLayers () {
      return isArray(this.layers) ? this.layers.join(',') : this.layers
    },
    /**
     * @type {string|undefined}
     */
    inputTime () {
      return isArray(this.time) ? this.time.join(',') : this.time
    },
    /**
     * @return {undefined|string}
     */
    inputLayerDefs () {
      return serialize(this.layerDefs)
    },
    /**
     * @return {undefined|string}
     */
    inputDynamicLayers () {
      return serialize(this.dynamicLayers)
    },
    /**
     * @return {undefined|string}
     */
    inputLayerTimeOptions () {
      return serialize(this.layerTimeOptions)
    },
    /**
     * @return {undefined|string}
     */
    inputDatumTransformations () {
      return serialize(this.datumTransformations)
    },
    /**
     * @return {undefined|string}
     */
    inputMapRangeValues () {
      return serialize(this.mapRangeValues)
    },
    /**
     * @return {undefined|string}
     */
    inputLayerRangeValues () {
      return serialize(this.layerRangeValues)
    },
    /**
     * @return {undefined|string}
     */
    inputLayerParameterValues () {
      return serialize(this.layerParameterValues)
    },
    /**
     * @return {undefined|string}
     */
    inputHistoricMoment () {
      return serialize(this.historicMoment)
    },
    /**
     * @returns {Object|null}
     */
    customParams () {
      return this.params ? cleanArcGisSourceParams(this.params) : undefined
    },
    /**
     * @returns {Object}
     */
    inputParams () {
      return {
        ...this.customParams || {},
        LAYERS: this.inputLayers,
        FORMAT: this.format,
        LAYERDEFS: this.inputLayerDefs,
        DYNAMICLAYERS: this.inputDynamicLayers,
        DPI: this.dpi,
        TRANSPARENT: this.transparent,
        TIME: this.inputTime,
        LAYERTIMEOPTIONS: this.inputLayerTimeOptions,
        GDBVERSION: this.gdbVersion,
        MAPSCALE: this.mapScale,
        ROTATION: this.rotation,
        DATUMTRANSFORMATIONS: this.inputDatumTransformations,
        MAPRANGEVALUES: this.inputMapRangeValues,
        LAYERRANGEVALUES: this.inputLayerRangeValues,
        LAYERPARAMETERVALUES: this.inputLayerParameterValues,
        HISTORICMOMENT: this.inputHistoricMoment,
      }
    },
    .../*#__PURE__*/reduce([
      'format',
      'inputLayers',
      'inputLayerDefs',
      'inputDynamicLayers',
      'dpi',
      'transparent',
      'inputTime',
      'inputLayerTimeOptions',
      'gdbVersion',
      'mapScale',
      'rotation',
      'inputDatumTransformations',
      'inputMapRangeValues',
      'inputLayerRangeValues',
      'inputLayerParameterValues',
      'inputHistoricMoment',
    ], (props, inProp) => {
      const prop = inProp.slice(0, 5) === 'input' ? lowerFirst(inProp.slice(5)) : inProp
      const curProp = 'current' + upperFirst(prop)
      props[curProp] = function () {
        return coalesce((this.currentParams || {})[prop.toUpperCase()], (this.inputParams || {})[prop.toUpperCase()])
      }

      return props
    }, {}),
  },
  watch: {
    rev () {
      if (!this.$source) return

      if (!isEqual(this.currentParams, this.$source.getParams())) {
        this.currentParams = this.$source.getParams()
      }
    },
    .../*#__PURE__*/makeWatchers([
      'currentFormat',
      'currentLayers',
      'currentLayerDefs',
      'currentDynamicLayers',
      'currentDpi',
      'currentTransparent',
      'currentTime',
      'currentLayerTimeOptions',
      'currentGdbVersion',
      'currentMapScale',
      'currentRotation',
      'currentDatumTransformations',
      'currentMapRangeValues',
      'currentLayerRangeValues',
      'currentLayerParameterValues',
      'currentHistoricMoment',
    ], curProp => function (value) {
      const prop = lowerFirst(curProp.slice(7))
      const inProp = hasProp(this, 'input' + upperFirst(prop)) ? 'input' + upperFirst(prop) : prop

      if (isEqual(value, this[inProp])) return

      this.$emit('update:' + prop, isObjectLike(value) ? clonePlainObject(value) : value)
    }),
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'hidpi',
      'inputParams',
      'currentParams',
    ], [
      'inputParams',
      'currentParams',
    ]),
  },
  created () {
    this.currentParams = this.inputParams && clonePlainObject(this.inputParams)
  },
  methods: {
    /**
     * @returns {Object}
     */
    getParams () {
      return coalesce(this.$source?.getParams(), this.currentParams)
    },
    /**
     * @param {Object} params
     */
    updateParams (params) {
      params = reduce({ ...this.currentParams, ...params }, (params, value, name) => ({
        ...params,
        [name.toUpperCase()]: value,
      }), {})

      if (!isEqual(params, this.currentParams)) {
        this.currentParams = params
      }
      if (this.$source && !isEqual(params, this.$source.getParams())) {
        this.$source.updateParams(params)
      }
    },
    /**
     * @param {string} param
     * @param {*} value
     */
    updateParam (param, value) {
      this.updateParams({ [param.toUpperCase()]: value })
    },
    /**
     * @param {Object|undefined} value
     * @protected
     */
    inputParamsChanged (value) {
      this.updateParams(value)
    },
    /**
     * @param {Object|undefined} value
     * @protected
     */
    currentParamsChanged (value) {
      value = value ? cleanArcGisSourceParams(value) : undefined
      if (isEqual(value, this.customParams)) return

      this.$emit('update:params', value && clonePlainObject(value))
    },
  },
}
