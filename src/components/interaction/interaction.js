import rxSubs from 'vl-mixins/rx-subs'
import stubVNode from 'vl-mixins/stub-vnode'
import { warn } from 'vl-utils/debug'

const props = {}

const methods = {
  /**
   * @protected
   */
  initialize () {
    /**
     * @type {Interaction}
     * @protected
     */
    this.interaction = this.createInteraction()
    this.interaction.set('vm', this)
  },
  /**
   * @return {Interaction}
   * @protected
   */
  createInteraction () {
    throw new Error('Not implemented method')
  },
  /**
   * @protected
   */
  mountInteraction () {
    if (this.map) {
      this.map.addInteraction(this.interaction)
      this.subscribeAll()
    } else if (process.env.NODE_ENV !== 'production') {
      warn("Invalid usage of interaction component, should have map component among it's ancestors")
    }
  },
  /**
   * @protected
   */
  unmountInteraction () {
    this.unsubscribeAll()
    this.map && this.map.removeInteraction(this.interaction)
  },
  refresh () {
    this.interaction.changed()
  }
}

export default {
  mixins: [ rxSubs, stubVNode ],
  inject: [ 'map' ],
  props,
  methods,
  stubVNode: {
    empty () {
      return this.$options.name
    }
  },
  provide () {
    return Object.defineProperties(Object.create(null), {
      interaction: {
        enumerable: true,
        get: () => this.interaction
      }
    })
  },
  created () {
    this.initialize()
  },
  mounted () {
    this.$nextTick(this.mountInteraction)
  },
  destroyed () {
    this.$nextTick(() => {
      this.unmountInteraction()
      this.interaction = undefined
    })
  }
}
