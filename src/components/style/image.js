import style from './style'
import { assertHasStyleTarget } from '../../utils/assert'

const props = {
  snapToPixel: {
    type: Boolean,
    default: true
  }
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
  // protected & private
  /**
   * @return {void}
   * @protected
   */
  mount () {
    assertHasStyleTarget(this)
    this.styleTarget.setImage(this.style)
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    assertHasStyleTarget(this)
    this.styleTarget.setImage(undefined)
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
