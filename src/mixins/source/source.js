import exposeInject from 'vuelayers/src/mixins/expose-inject'
import rxSubs from 'vuelayers/src/mixins/rx-subs'
import { consts as olConsts } from 'vuelayers/src/ol'

const props = {
  attributions: String,
  url: String,
  projection: {
    type: String,
    default: olConsts.MAP_PROJECTION
  },
  wrapX: {
    type: Boolean,
    default: true
  },
  logo: String
}

const methods = {
  /**
   * @return {ol.source.Source}
   * @protected
   */
  createSource () {
    throw new Error('Not implemented method')
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
    // todo recreate source?
  }
}

export default {
  mixins: [ exposeInject, rxSubs ],
  inject: [ 'layer', 'map', 'view' ],
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
    this.source.vm = this
  },
  mounted () {
    this.layer.setSource(this.source)
  },
  beforeDestroy () {
    this.layer.setSource(undefined)
  },
  destroyed () {
    this.source = undefined
  }
}
