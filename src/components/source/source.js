import rxSubs from 'vl-mixins/rx-subs'
import { consts as olConsts } from 'vl-ol'
import { warn } from 'vl-utils/debug'

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
    this.source.$vm = this
  },
  /**
   * @return {ol.source.Source}
   * @protected
   */
  createSource () {
    throw new Error('Not implemented method')
  },
  mountSource () {
    if (this.layer()) {
      this.layer().setSource(this.source)
    } else if (process.env.NODE_ENV !== 'production') {
      warn("Invalid usage of source component, should have layer component among it's ancestors")
    }
  },
  unmountSource () {
    this.layer() && this.layer().setSource(undefined)
  },
  refresh () {
    this.source.changed()
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
  mixins: [ rxSubs ],
  inject: [ 'layer' ],
  props,
  methods,
  watch,
  provide () {
    return {
      source: () => this.source
    }
  },
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
  destroyed () {
    this.unmountSource()
    this.source = undefined
  }
}
