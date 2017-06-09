/**
 * Basic component with stub VNode, i.e. virtual component
 * @module components/virt-cmp
 */
import cmp from './cmp'
import stubVNode from './stub-vnode'

export default {
  mixins: [stubVNode, cmp],
  methods: {
    /**
     * Redefine for easy call in child components
     * @returns {Object}
     * @protected
     */
    getServices () {
      return cmp.methods.getServices()
    }
  }
}
