/**
 * Basic style mixin.
 * Exposes for children inner OpenLayer style object as styleTarget.
 * Injects styleTarget from parent to apply self style.
 */
import exposeInject from 'vuelayers/src/mixins/expose-inject'

const methods = {
  /**
   * @return {ol.style.Style|ol.style.Image|ol.style.Fill|ol.style.Stroke|ol.style.Text}
   * @protected
   */
  createStyle () {
    throw new Error('Not implemented method')
  },
  expose () {
    return {
      ...this.$parent.expose(),
      style: this.style,
      styleTarget: this.style
    }
  },
  /**
   * @protected
   */
  append () {
    throw new Error('Not implemented method')
  },
  /**
   * @protected
   */
  remove () {
    throw new Error('Not implemented method')
  }
}

export default {
  mixins: [ exposeInject ],
  inject: [ 'styleTarget' ],
  methods,
  render: h => h(),
  created () {
    /**
     * @type {ol.style.Style|ol.style.Image|ol.style.Fill|ol.style.Stroke|ol.style.Text}
     * @protected
     */
    this.style = this.createStyle()
    this.style.vm = this
  },
  destroyed () {
    this.style = undefined
  },
  mounted () {
    this.append()
  },
  beforeDestroy () {
    this.remove()
  }
}

