/**
 * Basic style mixin.
 */
import { debounce } from 'lodash/fp'
import mergeDescriptors from '../../utils/multi-merge-descriptors'
import stubVNode from '../stub-vnode'
import services from '../services'
import { VM_PROP } from '../../consts'

const methods = {
  /**
   * @return {OlStyle}
   * @protected
   * @abstract
   */
  createStyle () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {void}
   * @protected
   */
  initialize () {
    /**
     * @type {OlStyle|undefined}
     * @private
     */
    this._style = this.createStyle()
    this._style[VM_PROP] = this
    this::defineAccessors()
  },
  /**
   * @type {function():void}
   */
  deferRefresh: debounce(100, function () {
    this.refresh()
  }),
  /**
   * Inner ol style instance getter
   * @return {OlStyle|undefined}
   */
  getStyle () {
    return this._style
  },
  /**
   * @return {Object}
   * @protected
   */
  getServices () {
    return mergeDescriptors(this::services.methods.getServices(), {
      style: this
    })
  },
  /**
   * @return {void}
   * @protected
   * @abstract
   */
  mount () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {void}
   * @protected
   * @abstract
   */
  unmount () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {void}
   */
  refresh () {
    this.unmount()
    this.mount()
  }
}

export default {
  mixins: [stubVNode, services],
  methods,
  stubVNode: {
    empty () {
      return this.$options.name
    }
  },
  created () {
    this.initialize()
  },
  mounted () {
    this.mount()
  },
  destroyed () {
    this.unmount()
    this._style = undefined
  }
}

/**
 * @return {void}
 * @private
 */
function defineAccessors () {
  Object.defineProperties(this, {
    style: {
      enumerable: true,
      get: this.getStyle
    },
    map: {
      enumerable: true,
      get: () => this.services.map
    }
  })
}
