import style from './style'

const props = {
  snapToPixel: {
    type: Boolean,
    default: true
  }
}

const { refresh: styleRefresh } = style.methods
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
  inject: style.inject.concat([ 'setImage' ]),
  props,
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
