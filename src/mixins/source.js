import { MAP_PROJECTION, createAttributions } from 'vuelayers/src/ol'

const props = {
  attributions: Array,
  projection: {
    type: String,
    default: MAP_PROJECTION
  }
}

const methods = {
  /**
   * @return {ol.source.Source}
   * @protected
   */
  createSource () {
    throw new Error('Not implemented')
  }
}

const watch = {
  attributions (value) {
    this.source.setAttributions(createAttributions(value))
  },
  projection (value) {
    this.source.setProjection(value)
  }
}

export default {
  name: 'vl-source',
  props,
  methods,
  watch,
  beforeCreate () {
    try {
      /**
       * @type {ol.Map}
       * @protected
       */
      this.map = this.$parent.getMap()
      /**
       * @type {ol.layer.Layer}
       * @protected
       */
      this.layer = this.$parent.getLayer()
    } catch (err) {
      throw new Error('Source component used not in layer component.')
    }
  },
  create () {
    this.source = this.createSource()
  },
  mounted () {
    this.layer.setSource(this.source)
  },
  beforeDestroy () {
    this.layer && this.layer.setSource(undefined)

    this.source = this.layer = this.map = undefined
  }
}
