/**
 * Basic style mixin.
 * Exposes for children inner OpenLayer style object as styleTarget.
 * Injects styleTarget from parent to apply self style.
 */
import { debounce } from 'lodash/fp'
import stubVNode from '../stub-vnode'
import { SERVICE_CONTAINER_KEY } from '../../consts'

const methods = {
  /**
   * Inner ol style instance getter
   * @return {OlStyle|undefined}
   */
  getStyle () {
    return this._style
  },
  /**
   * @return {void}
   */
  refresh () {
    this.unmount()
    this.mount()
  },
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
  // protected & private
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
    this::defineAccessors()
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
  mixins: [stubVNode],
  methods,
  stubVNode: {
    empty () {
      return this.$options.name
    }
  },
  inject: {
    serviceContainer: SERVICE_CONTAINER_KEY
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
    styleTarget: {
      enumerable: true,
      get: () => this.serviceContainer.styleTarget
    },
    map: {
      enumerable: true,
      get: () => this.serviceContainer.map
    },
    view: {
      enumerable: true,
      get: () => this.serviceContainer.view
    }
  })
}

/**
 * @typedef {ol.style.Style|ol.style.Image|ol.style.Fill|ol.style.Stroke|ol.style.Text|ol.StyleFunction} OlStyle
 */
