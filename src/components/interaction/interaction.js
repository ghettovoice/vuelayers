import rxSubs from 'vl-mixins/rx-subs'
import { warn } from 'vl-utils/debug'

const props = {}

const methods = {
  /**
   * @protected
   */
  initialize () {
    /**
     * @type {ol.interaction.Interaction}
     * @protected
     */
    this.interaction = this.createInteraction()
    this.interaction.$vm = this
  },
  /**
   * @return {ol.interaction.Interaction}
   * @protected
   */
  createInteraction () {
    throw new Error('Not implemented method')
  },
  /**
   * @protected
   */
  mountInteraction () {
    if (this.map()) {
      this.map() && this.map().addInteraction(this.interaction)
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
    this.map() && this.map().removeInteraction(this.interaction)
  },
  refresh () {
    this.interaction && this.interaction.changed()
  }
}

export default {
  mixins: [ rxSubs ],
  inject: [ 'map' ],
  props,
  methods,
  provide () {
    return {
      interaction: () => this.interaction
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
    this.mountInteraction()
  },
  destroyed () {
    this.unmountInteraction()
    this.interaction = undefined
  }
}
