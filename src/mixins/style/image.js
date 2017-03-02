import { debounce } from 'lodash/fp'
import style from 'vuelayers/src/mixins/style/style'

const styleRefresh = style.methods.refresh

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
  },
  refresh: debounce(100, function () {
    this.style = this.createStyle()
    this.style.vm = this
    this::styleRefresh()
  })
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
