import stubVNode from 'vl-mixins/stub-vnode'
/**
 * Basic style mixin.
 * Exposes for children inner OpenLayer style object as styleTarget.
 * Injects styleTarget from parent to apply self style.
 */

const methods = {
  /**
   * @protected
   */
  initialize () {
    /**
     * @type {ol.style.Style|ol.style.Image|ol.style.Fill|ol.style.Stroke|ol.style.Text}
     * @protected
     */
    this.style = this.createStyle()
    this.style.$vm = this
  },
  /**
   * @return {ol.style.Style|ol.style.Image|ol.style.Fill|ol.style.Stroke|ol.style.Text}
   * @protected
   */
  createStyle () {
    throw new Error('Not implemented method')
  },
  /**
   * @protected
   */
  mountStyle () {
    throw new Error('Not implemented method')
  },
  /**
   * @protected
   */
  unmountStyle () {
    throw new Error('Not implemented method')
  },
  refresh () {
    this.$nextTick(() => {
      this.unmountStyle()
      this.mountStyle()
    })
  }
}

export default {
  mixins: [ stubVNode ],
  methods,
  stubVNode: {
    empty () {
      return this.$options.name
    }
  },
  mounted () {
    // Create style in  mounted hook because of some ol style classes doesn't have
    // setters for all inner objects. This setters are emulated through method: getStyleTarget
    this.initialize()
    this.$nextTick(this.mountStyle)
  },
  destroyed () {
    this.$nextTick(() => {
      this.unmountStyle()
      this.style = undefined
    })
  }
}
