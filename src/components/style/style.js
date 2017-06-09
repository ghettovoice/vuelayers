/**
 * Basic style mixin.
 */
import mergeDescriptors from '../../utils/multi-merge-descriptors'
import cmp from '../virt-cmp'
import { VM_PROP } from '../../consts'

const methods = {
  /**
   * @return {void}
   * @protected
   */
  init () {
    /**
     * @type {OlStyle|undefined}
     * @private
     */
    this._style = this.createStyle()
    this._style[VM_PROP] = this
  },
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
  deinit () {
    this._style = undefined
  },
  /**
   * @return {void}
   * @protected
   */
  defineAccessors () {
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
  },
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
    return mergeDescriptors(this::cmp.methods.getServices(), {
      style: this
    })
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
  mixins: [cmp],
  methods,
  stubVNode: {
    empty () {
      return this.$options.name
    }
  }
}
