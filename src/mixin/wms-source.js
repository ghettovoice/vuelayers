import { WMS_VERSION } from '../ol-ext'
import { hasSource, hasView } from '../util/assert'
import { reduce } from '../util/minilo'

const cleanExtParams = params => reduce(params, (params, value, key) => {
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

const props = {
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
}

const computed = {
  cleanExtParams () {
    return this.extParams ? cleanExtParams(this.extParams) : undefined
  },
  allParams () {
    return {
      ...this.cleanExtParams,
      LAYERS: this.layers,
      STYLES: this.styles,
      VERSION: this.version,
      FORMAT: this.format,
      TRANSPARENT: this.transparent,
      BGCOLOR: this.bgColor,
      TIME: this.time,
    }
  },
}

const methods = {
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
  transparent (TRANSPARENT) {
    this.$source && this.$source.updateParams({ TRANSPARENT })
  },
  time (TIME) {
    this.$source && this.$source.updateParams({ TIME })
  },
  bgColor (BGCOLOR) {
    this.$source && this.$source.updateParams({ BGCOLOR })
  },
  extParams (value) {
    this.$source && this.$source.updateParams(value ? cleanExtParams(value) : undefined)
  },
}

export default {
  props,
  computed,
  methods,
  watch,
}
