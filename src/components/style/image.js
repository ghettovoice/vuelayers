import style from './style'

const props = {
  snapToPixel: {
    type: Boolean,
    default: true
  }
}

const methods = {
  /**
   * @return {Promise}
   * @protected
   */
  init () {
    return this::style.methods.init()
  },
  /**
   * @return {void|Promise<void>}
   * @protected
   */
  deinit () {
    return this::style.methods.deinit()
  },
  /**
   * @return {void}
   * @protected
   */
  mount () {
    this.$parent && this.$parent.setImage(this)
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    this.$parent && this.$parent.setImage(undefined)
  },
  /**
   * @return {Promise}
   */
  refresh () {
    // recreate style
    return Promise.resolve(this.unmount())
      .then(this.deinit)
      .then(this.init)
      .then(this.mount)
  }
}

const watch = {
  snapToPixel () {
    this.requestRefresh()
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
