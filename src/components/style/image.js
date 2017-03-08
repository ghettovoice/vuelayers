import style from 'vl-components/style/style'

const styleRefresh = style.methods.refresh
const methods = {
  /**
   * @protected
   */
  mountStyle () {
    this.setImage(this.style)
  },
  /**
   * @protected
   */
  unmountStyle () {
    this.setImage(undefined)
  },
  refresh () {
    this.$nextTick(() => {
      this.initialize()
      this::styleRefresh()
    })
  }
}

export default {
  mixins: [ style ],
  inject: [ 'setImage' ],
  methods,
  stubVNode: {
    empty: false,
    attrs () {
      return {
        id: this.$options.name
      }
    }
  }
}
