import WMSServerType from 'ol/source/WMSServerType'
import { cleanSourceParams } from '../ol-ext'
import {
  clonePlainObject,
  coalesce,
  hasProp,
  isArray,
  isEqual, isObjectLike,
  lowerFirst,
  makeWatchers,
  reduce,
  upperFirst,
} from '../utils'
import { makeChangeOrRecreateWatchers } from './ol-cmp'

const cleanWmsSourceParams = params => cleanSourceParams(params, [
  'LAYERS',
  'VERSION',
  'STYLES',
  'FORMAT',
  'TRANSPARENT',
  'BGCOLOR',
  'TIME',
])

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
  data () {
    return {
      currentParams: undefined,
    }
  },
  computed: {
    /**
     * @returns {string}
     */
    inputLayers () {
      return isArray(this.layers) ? this.layers.join(',') : this.layers
    },
    /**
     * @returns {string|undefined}
     */
    inputStyles () {
      return isArray(this.styles) ? this.styles.join(',') : this.styles
    },
    /**
     * @returns {Object|null}
     */
    customParams () {
      return this.params ? cleanWmsSourceParams(this.params) : undefined
    },
    /**
     * @returns {Object}
     */
    inputParams () {
      return {
        ...this.customParams || {},
        LAYERS: this.inputLayers,
        STYLES: this.inputStyles,
        VERSION: this.version,
        FORMAT: this.format,
        TRANSPARENT: this.transparent,
        BGCOLOR: this.bgColor,
        TIME: this.time,
      }
    },
    .../*#__PURE__*/reduce([
      'inputLayers',
      'inputStyles',
      'version',
      'format',
      'transparent',
      'bgColor',
      'time',
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
      'currentLayers',
      'currentStyles',
      'currentVersion',
      'currentFormat',
      'currentTransparent',
      'currentBgColor',
      'currentTime',
    ], curProp => function (value) {
      const prop = lowerFirst(curProp.slice(7))
      const inProp = hasProp(this, 'input' + upperFirst(prop)) ? 'input' + upperFirst(prop) : prop

      if (isEqual(value, this[inProp])) return

      this.$emit('update:' + prop, isObjectLike(value) ? clonePlainObject(value) : value)
    }),
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'hidpi',
      'serverType',
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
     * @param {number[]} coordinate
     * @param {number} [resolution]
     * @param {string} [projection]
     * @param {Object|undefined} [params] GetFeatureInfo params. `info_format` at least should be provided.
     *                          If `query_layers` is not provided then the layers specified in the `layers` prop will be used.
     *                          `version` should not be specified here (value from `version` prop will be used).
     * @return {Promise<string|undefined>}
     */
    async getFeatureInfoUrl (coordinate, resolution, projection, params = {}) {
      resolution || (resolution = this.$viewVm?.getResolution())
      projection || (projection = this.resolvedDataProjection)

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
      value = value ? cleanWmsSourceParams(value) : undefined
      if (isEqual(value, this.customParams)) return

      this.$emit('update:params', value && clonePlainObject(value))
    },
  },
}
