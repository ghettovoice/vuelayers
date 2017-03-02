import rxSubs from 'vl-mixins/rx-subs'

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
    this.interaction.vm = this
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
    this.map().addInteraction(this.interaction)
  },
  /**
   * @protected
   */
  unmountInteraction () {
    this.map().removeInteraction(this.interaction)
  },
  refresh () {
    this.interaction.changed()
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
  beforeDestroy () {
    this.unmountInteraction()
  },
  destroyed () {
    this.interaction = undefined
  }
}
