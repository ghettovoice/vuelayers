import style from './style'

const props = {
  snapToPixel: Boolean // default true
}

const methods = {
  /**
   * @return {void}
   */
  refresh () {
    this.unmount()
    // recreate style
    this.initialize()
    this.mount()
  },
  /**
   * @return {void}
   * @protected
   */
  mount () {
    this.$parent.setImage(this)
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    this.$parent.setImage(undefined)
  }
}

const watch = {
  snapToPixel () {
    this.deferRefresh()
  }
}

export default {
  mixins: [style],
  props,
  methods,
  watch,
  stubVNode: {
    empty: false,
    attrs () {
      return {
        id: this.$options.name
      }
    }
  }
}
