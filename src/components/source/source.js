import exposeInject from 'vl-mixins/expose-inject'
import rxSubs from 'vl-mixins/rx-subs'
import { consts as olConsts } from 'vl-ol'

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
   * @protected
   */
  initialize () {
    /**
     * @type {ol.source.Source}
     * @protected
     */
    this.source = this.createSource()
    this.source.vm = this
  },
  /**
   * @return {ol.source.Source}
   * @protected
   */
  createSource () {
    throw new Error('Not implemented method')
  },
  mountSource () {
    this.layer.setSource(this.source)
  },
  unmountSource () {
    this.layer.setSource(undefined)
  },
  refresh () {
    this.source.changed()
  },
  /**
   * @return {{source: *}}
   * @protected
   */
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
        display: 'none !important'
      }
    }, this.$slots.default)
  },
  created () {
    this.initialize()
  },
  mounted () {
    this.mountSource()
  },
  beforeDestroy () {
    this.unmountSource()
  },
  destroyed () {
    this.source = undefined
  }
}
