/**
 * Basic component mixin
 * @module components/cmp
 */
import uuid from 'uuid/v4'
import { debounce } from 'lodash/fp'
import rxSubs from './rx-subs'
import services from './services'

const props = {
  id: {
    type: [String, Number],
    default: () => uuid()
  }
}

const methods = {
  /**
   * @return {void}
   * @protected
   */
  init () {},
  /**
   * @return {void}
   * @protected
   */
  deinit () {},
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
    return services.methods.getServices()
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
  mixins: [rxSubs, services],
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
