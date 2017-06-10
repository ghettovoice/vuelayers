/**
 * Basic ol component mixin
 * @module components/cmp
 */
import { debounce } from 'lodash/fp'
import rxSubs from './rx-subs'
import services from './services'
import identMap from './ident-map'
import { VM_PROP } from '../consts'

const props = {}

const methods = {
  /**
   * @return {void}
   * @protected
   */
  init () {
    this.olObject = undefined
    if (this.ident && this.identMap.has(this.ident)) {
      this.olObject = this.identMap.get(this.ident)
    } else {
      /**
       * @type {*}
       * @protected
       */
      this.olObject = this.createOlObject()
      if (this.ident) {
        this.identMap.set(this.ident, this.olObject)
      }
    }
    this.olObject[VM_PROP] || (this.olObject[VM_PROP] = [])
    this.olObject[VM_PROP].push(this)
  },
  /**
   * @return {*}
   * @protected
   * @abstract
   */
  createOlObject () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {void}
   * @protected
   */
  deinit () {
    if (this.ident) {
      this.identMap.unset(this.ident)
    }
    this.olObject[VM_PROP] = this.olObject[VM_PROP].filter(vm => vm !== this)
    this.olObject = undefined
  },
  /**
   * @protected
   * @return {void}
   */
  defineAccessors () {},
  /**
   * @type {function():void}
   */
  requestRefresh: debounce(100, function () {
    this.refresh()
  }),
  /**
   * Redefine for easy call in child components
   * @returns {Object}
   * @protected
   */
  getServices () {
    return this::services.methods.getServices()
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
  refresh () {},
  /**
   * @return {void}
   * @protected
   */
  subscribeAll () {}
}

export default {
  mixins: [identMap, rxSubs, services],
  props,
  methods,
  created () {
    this.init()
    this.defineAccessors()
  },
  mounted () {
    this.mount()
  },
  destroyed () {
    this.unmount()
    this.deinit()
  }
}
