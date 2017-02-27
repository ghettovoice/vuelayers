import exposeContext from 'vuelayers/src/mixins/expose-context'
import { consts as olConsts } from 'vuelayers/src/ol'

const props = {
  attributions: String,
  projection: {
    type: String,
    default: olConsts.MAP_PROJECTION
  },
  wrapX: {
    type: Boolean,
    default: true
  }
}

const methods = {
  /**
   * @return {ol.source.Source}
   * @protected
   */
  createSource () {
    throw new Error('Not implemented')
  },
  refresh () {
    this.source.changed()
  },
  expose () {
    return {
      ...this.$parent.expose(),
      source: this.source
    }
  }
}

const watch = {
  attributions (value) {
    this.source.setAttributions(value)
  },
  projection (value) {
    this.source.setProjection(value)
  }
}

export default {
  name: 'vl-source',
  mixins: [ exposeContext ],
  props,
  methods,
  watch,
  render (h) {
    return h('i', {
      style: {
        display: 'none'
      }
    }, this.$slots.default)
  },
  created () {
    /**
     * @type {ol.source.Source}
     * @protected
     */
    this.source = this.createSource()
  },
  mounted () {
    this.$context.layer.setSource(this.source)
  },
  beforeDestroy () {
    this.$context.layer.setSource(undefined)
  },
  destroyed () {
    this.source = undefined
  }
}
