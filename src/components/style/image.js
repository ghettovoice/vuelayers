import { debounce } from 'lodash/fp'
import style from 'vl-components/style/style'

const styleRefresh = style.methods.refresh

const methods = {
  /**
   * @protected
   */
  mountStyle () {
    this.styleTarget && this.styleTarget.setImage(this.style)
  },
  /**
   * @protected
   */
  unmountStyle () {
    this.styleTarget && this.styleTarget.setImage(undefined)
  },
  refresh: debounce(100, function () {
    this.initialize()
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
