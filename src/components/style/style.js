/**
 * Basic style mixin.
 */
import { debounce } from 'lodash/fp'
import mergeDescriptors from '../../utils/multi-merge-descriptors'
import stubVNode from '../stub-vnode'
import services from '../services'

const methods = {
  /**
   * @param {number} [wait=100]
   * @returns {Promise}
   */
  deferRefresh (wait = 100) {
    return new Promise(resolve => {
      if (!this.__deferRefresh) {
        this.__deferRefresh = debounce(wait, () => {
          this.refresh()
          resolve()
        })
      }

      this.__deferRefresh()
    })
  },
  /**
   * @return {void}
   */
  refresh () {
    this.unmount()
    this.mount()
  },
  /**
   * Inner ol style instance getter
   * @return {OlStyle|undefined}
   */
  getStyle () {
    return this._style
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
    this::defineAccessors()
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
