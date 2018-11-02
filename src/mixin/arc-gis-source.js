import { reduce } from '../util/minilo'

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
  layers (LAYERS) {
    this.$source && this.$source.updateParams({ LAYERS })
  },
  format (FORMAT) {
    this.$source && this.$source.updateParams({ FORMAT })
  },
  layerDefs (LAYERDEFS) {
    this.$source && this.$source.updateParams({ LAYERDEFS: serialize(LAYERDEFS) })
  },
  dynamicLayers (DYNAMICLAYERS) {
    this.$source && this.$source.updateParams({ DYNAMICLAYERS: serialize(DYNAMICLAYERS) })
  },
  dpi (DPI) {
    this.$source && this.$source.updateParams({ DPI })
  },
  transparent (TRANSPARENT) {
    this.$source && this.$source.updateParams({ TRANSPARENT })
  },
  time (TIME) {
    this.$source && this.$source.updateParams({ TIME: serialize(TIME) })
  },
  layerTimeOptions (LAYERTIMEOPTIONS) {
    this.$source && this.$source.updateParams({ LAYERTIMEOPTIONS: serialize(LAYERTIMEOPTIONS) })
  },
  gdbVersion (GDBVERSION) {
    this.$source && this.$source.updateParams({ GDBVERSION })
  },
  mapScale (MAPSCALE) {
    this.$source && this.$source.updateParams({ MAPSCALE })
  },
  rotation (ROTATION) {
    this.$source && this.$source.updateParams({ ROTATION })
  },
  datumTransformations (DATUMTRANSFORMATIONS) {
    this.$source && this.$source.updateParams({ DATUMTRANSFORMATIONS: serialize(DATUMTRANSFORMATIONS) })
  },
  mapRangeValues (MAPRANGEVALUES) {
    this.$source && this.$source.updateParams({ MAPRANGEVALUES: serialize(MAPRANGEVALUES) })
  },
  layerRangeValues (LAYERRANGEVALUES) {
    this.$source && this.$source.updateParams({ LAYERRANGEVALUES: serialize(LAYERRANGEVALUES) })
  },
  layerParameterValues (LAYERPARAMETERVALUES) {
    this.$source && this.$source.updateParams({ LAYERPARAMETERVALUES: serialize(LAYERPARAMETERVALUES) })
  },
  historicMoment (HISTORICMOMENT) {
    this.$source && this.$source.updateParams({ HISTORICMOMENT })
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
