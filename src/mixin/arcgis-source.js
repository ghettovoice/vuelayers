import { isEqual, reduce } from '../util/minilo'
import { makeWatchers } from '../util/vue-helpers'

const cleanExtParams = params => reduce(params, (params, value, key) => {
  let filterKeys = [
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
  ]

  key = key.toUpperCase()
  if (filterKeys.includes(key)) {
    return params
  }

  params[key] = value

  return params
}, {})

const serialize = value => {
  if (value == null) return value

  return typeof value === 'object' ? JSON.stringify(value) : value
}

const props = {
  /**
   * Extra WMS request parameters
   */
  extParams: Object,
  format: {
    type: String,
    default: 'PNG32',
  },
  layers: String,
  layerDefs: [Object, String],
  dynamicLayers: [Object, String],
  dpi: Number,
  transparent: {
    type: Boolean,
    default: true,
  },
  time: String,
  layerTimeOptions: [Object, String],
  gdbVersion: String,
  mapScale: String,
  rotation: Number,
  datumTransformations: [Array, String],
  mapRangeValues: [Array, String],
  layerRangeValues: [Array, String],
  layerParameterValues: [Array, String],
  historicMoment: Number,
}

const computed = {
  cleanExtParams () {
    return this.extParams ? cleanExtParams(this.extParams) : undefined
  },
  allParams () {
    return {
      ...this.cleanExtParams,
      LAYERS: this.layers,
      FORMAT: this.format,
      LAYERDEFS: serialize(this.layerDefs),
      DYNAMICLAYERS: serialize(this.dynamicLayers),
      DPI: this.dpi,
      TRANSPARENT: this.transparent,
      TIME: serialize(this.time),
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
}

const methods = {}

const watch = {
  ...makeWatchers([
    'layers',
    'format',
    'dpi',
    'transparent',
    'gdbVersion',
    'mapScale',
    'rotation',
    'historicMoment',
  ], prop => function (value, prevValue) {
    if (isEqual(value, prevValue)) return

    prop = prop.toUpperCase()
    this.$source && this.$source.updateParams({ [prop]: value })
  }),
  ...makeWatchers([
    'layerDefs',
    'dynamicLayers',
    'time',
    'layerTimeOptions',
    'datumTransformations',
    'mapRangeValues',
    'layerRangeValues',
    'layerParameterValues',
  ], prop => function (value, prevValue) {
    if (isEqual(value, prevValue)) return

    prop = prop.toUpperCase()
    this.$source && this.$source.updateParams({ [prop]: serialize(value) })
  }),
  extParams (value, prevValue) {
    if (isEqual(value, prevValue)) return

    this.$source && this.$source.updateParams(value ? cleanExtParams(value) : undefined)
  },
}

export default {
  props,
  computed,
  methods,
  watch,
}
