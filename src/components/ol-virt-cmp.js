/**
 * Basic ol component with stub VNode, i.e. virtual component
 * @module components/virt-cmp
 */
import cmp from './ol-cmp'
import stubVNode from './stub-vnode'

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
    }
  }
}
