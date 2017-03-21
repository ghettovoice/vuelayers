import rxSubs from 'vl-mixins/rx-subs'
import vmBind from 'vl-mixins/vm-bind'
import stubVNode from 'vl-mixins/stub-vnode'
import { consts } from 'vl-ol'
import { warn } from 'vl-utils/debug'

const props = {
  attributions: [ String, Array ],
  projection: {
    type: String,
    default: consts.MAP_PROJECTION
  },
  wrapX: {
    type: Boolean,
    default: true
  },
  logo: String
}

const computed = {
  currentProjection () {
    return this.projection
  },
  currentAttributions () {
    return this.attributions
  }
}

const methods = {
  /**
   * @protected
   */
  initialize () {
    /**
     * @type {Source}
     * @protected
     */
    this.source = this.createSource()
    this.bindSelfTo(this.source)
  },
  /**
   * @return {Source}
   * @protected
   */
  createSource () {
    throw new Error('Not implemented method')
  },
  mountSource () {
    if (this.layer) {
      this.layer.setSource(this.source)
      this.subscribeAll()
    } else if (process.env.NODE_ENV !== 'production') {
      warn("Invalid usage of source component, should have layer component among it's ancestors")
    }
  },
  unmountSource () {
    this.unsubscribeAll()
    this.layer && this.layer.setSource(undefined)
  },
  refresh () {
    this.source.changed()
  }
}

const watch = {
  currentAttributions (value) {
    this.source.setAttributions(value)
  },
  currentProjection (value) {
    // todo recreate source?
  }
}

export default {
  mixins: [ rxSubs, vmBind, stubVNode ],
  inject: [ 'layer' ],
  props,
  computed,
  methods,
  watch,
  stubVNode: {
    empty () {
      return this.$options.name
    }
  },
  provide () {
    return Object.defineProperties(Object.create(null), {
      source: {
        enumerable: true,
        get: () => this.source
      }
    })
  },
  created () {
    this.initialize()
  },
  mounted () {
    this.$nextTick(this.mountSource)
  },
  destroyed () {
    this.$nextTick(() => {
      this.unmountSource()
      this.source = undefined
    })
  }
}
