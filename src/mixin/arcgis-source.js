import { cleanSourceExtraParams } from '../ol-ext'
import { isEqual, pick } from '../util/minilo'
import { makeWatchers } from '../util/vue-helpers'

const serialize = value => {
  if (value == null) return value

  return typeof value === 'object' ? JSON.stringify(value) : value
}

export default {
  props: {
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
    /**
     * Extra ArcGIS request parameters
     * todo rename to extraParams
     */
    extParams: Object,
  },
  computed: {
    // todo rename to cleanExtraParams
    cleanExtParams () {
      return this.extParams
        ? cleanSourceExtraParams(this.extParams, [
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
        : undefined
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
  },
  watch: {
    ...makeWatchers([
      'layers',
      'format',
      'dpi',
      'transparent',
      'gdbVersion',
      'mapScale',
      'rotation',
      'historicMoment',
    ], prop => function (value) {
      if (!this.$source) return

      prop = prop.toUpperCase()
      const params = this.$source.getParams() || {}

      if (isEqual(value, params[value])) return

      this.$source.updateParams({ [prop]: value })
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
    ], prop => function (value) {
      if (!this.$source) return

      prop = prop.toUpperCase()
      value = serialize(value)
      const params = this.$source.getParams() || {}

      if (isEqual(value, params[value])) return

      this.$source.updateParams({ [prop]: value })
    }),
    extParams (value) {
      if (!this.$source) return

      const params = pick(this.$source.getParams() || {}, Object.keys(value))
      if (isEqual(value, params)) return

      this.$source.updateParams(value ? cleanSourceExtraParams(value) : undefined)
    },
  },
}
