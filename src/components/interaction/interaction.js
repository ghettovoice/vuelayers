import rxSubs from 'vl-mixins/rx-subs'
import stubVNode from 'vl-mixins/stub-vnode'

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
    if (!this.map) {
      throw new Error("Invalid usage of interaction component, should have map component among it's ancestors")
    }

    this.map.addInteraction(this.interaction)
    this.subscribeAll()
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
  inject: [ 'map', 'view' ],
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
