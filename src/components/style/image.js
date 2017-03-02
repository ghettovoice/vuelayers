import { debounce } from 'lodash/fp'
import style from 'vl-components/style/style'

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
  recreate () {
    this.style = this.createStyle()
    this.style.vm = this
  },
  refresh: debounce(100, function () {
    this.recreate()
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
