import cmp from './ol-cmp'
import stubVNode from './stub-vnode'

/**
 * Basic ol component with stub VNode, i.e. virtual component
 */
export default {
  mixins: [stubVNode, cmp],
  methods: {
    /**
     * @return {Promise}
     * @protected
     */
    init () {
      return this::cmp.methods.init()
    },
    /**
     * @return {void|Promise<void>}
     * @protected
     */
    deinit () {
      return this::cmp.methods.deinit()
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
     * @return {void|Promise<void>}
     * @protected
     */
    mount () {
      return this::cmp.methods.mount()
    },
    /**
     * @return {void|Promise<void>}
     * @protected
     */
    unmount () {
      return this::cmp.methods.unmount()
    },
    /**
     * Redefine for easy call in child components
     * @returns {Object}
     * @protected
     */
    getServices () {
      return this::cmp.methods.getServices()
    },
    /**
     * Refresh internal ol objects
     * @return {Promise}
     */
    refresh () {
      return this::cmp.methods.refresh()
    },
    /**
     * Internal usage only in components that doesn't support refreshing.
     * @return {Promise<void>}
     * @protected
     */
    remount () {
      return this::cmp.methods.remount()
    },
    /**
     * Internal usage only in components that doesn't support refreshing.
     * @return {Promise<void>}
     * @protected
     */
    recreate () {
      return this::cmp.methods.recreate()
    },
    /**
     * @protected
     */
    subscribeAll () {
      this::cmp.methods.subscribeAll()
    },
  },
  stubVNode: {
    attrs () {
      return {
        id: this.vmId,
        class: this.cmpName,
      }
    },
  },
}
