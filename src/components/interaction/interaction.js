import rxSubs from 'vl-mixins/rx-subs'
import exposeInject from 'vl-mixins/expose-inject'

const props = {}

const methods = {
  /**
   * @return {ol.interaction.Interaction}
   * @protected
   */
  createInteraction () {
    throw new Error('Not implemented method')
  },
  getStyleTarget () {
    return {}
  },
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
    /**
     * @type {ol.interaction.Interaction}
     * @protected
     */
    this.interaction = this.createInteraction()
    this.interaction.vm = this
  },
  mounted () {
    this.map.addInteraction(this.interaction)
  },
  beforeDestroy () {
    this.map.removeInteraction(this.interaction)
  },
  destroyed () {
    this.interaction = undefined
  }
}
