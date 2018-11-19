import { isEqual } from '../util/minilo'
import style from './style'

const props = {
  snapToPixel: {
    type: Boolean,
    default: true,
  },
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
    this.$stylesContainer && this.$stylesContainer.setImage(this)
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    this.$stylesContainer && this.$stylesContainer.setImage(undefined)
  },
  /**
   * @return {Object}
   * @protected
   */
  getServices () {
    return this::style.methods.getServices()
  },
  /**
   * @return {Promise}
   */
  refresh () {
    // recreate style
    return this.recreate()
  },
}

const watch = {
  snapToPixel (value) {
    if (this.$style && !isEqual(value, this.$style.getSnapToPixel())) {
      this.scheduleRefresh()
    }
  },
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
        class: this.$options.name,
      }
    },
  },
}
