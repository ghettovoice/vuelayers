import { cleanSourceExtraParams, ARCGIS_EXTRA_PARAMS } from '../ol-ext'
import { isEqual } from '../util/minilo'
import { makeWatchers } from '../util/vue-helpers'

const serialize = value => {
  if (value == null) return value

  return typeof value === 'object' ? JSON.stringify(value) : value
}

export default {
  props: {
    /**
     * Extra ArcGIS request parameters
     * todo rename to extraParams
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
  },
  computed: {
    // todo rename to cleanExtraParams
    cleanExtParams () {
      return this.extParams
        ? cleanSourceExtraParams(this.extParams, ARCGIS_EXTRA_PARAMS)
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
    ], prop => function (value, prevValue) {
      if (isEqual(value, prevValue) || !this.$source) return

      prop = prop.toUpperCase()
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
    ], prop => function (value, prevValue) {
      if (isEqual(value, prevValue) || !this.$source) return

      prop = prop.toUpperCase()
      this.$source.updateParams({ [prop]: serialize(value) })
    }),
    extParams (value, prevValue) {
      if (isEqual(value, prevValue) || !this.$source) return

      this.$source.updateParams(value ? cleanSourceExtraParams(value) : undefined)
    },
  },
}
