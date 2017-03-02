import rxSubs from 'vl-mixins/rx-subs'
import exposeInject from 'vl-mixins/expose-inject'

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
    this.map.addInteraction(this.interaction)
  },
  /**
   * @protected
   */
  unmountInteraction () {
    this.map.removeInteraction(this.interaction)
  },
  /**
   * @return {{}}
   * @protected
   */
  getStyleTarget () {
    return {}
  },
  /**
   * @return {Object}
   * @protected
   */
  expose () {
    return {
      ...this.$parent.expose(),
      interaction: this.interaction,
      styleTarget: this.getStyleTarget()
    }
  },
  refresh () {
    this.interaction.changed()
  }
}

export default {
  mixins: [ exposeInject, rxSubs ],
  inject: [ 'map', 'view', 'serviceOverlay' ],
  props,
  methods,
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
