import style from 'vuelayers/src/mixins/style/style'

const methods = {
  /**
   * @protected
   */
  append () {
    this.styleTarget && this.styleTarget.setImage(this.style)
  },
  /**
   * @protected
   */
  remove () {
    this.styleTarget && this.styleTarget.setImage(undefined)
  }
}

export default {
  mixins: [ style ],
  methods,
  render (h) {
    return h('i', {
      style: {
        display: 'none !important'
      }
    }, this.$slots.default)
  }
}
