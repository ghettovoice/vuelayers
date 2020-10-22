import { getStyleId, initializeStyle, setStyleId } from '../ol-ext'
import { assert, mergeDescriptors } from '../utils'
import olCmp from './ol-cmp'
import stubVNode from './stub-vnode'

/**
 * Basic style mixin.
 */
export default {
  mixins: [
    stubVNode,
    olCmp,
  ],
  stubVNode: {
    empty () {
      return this.vmId
    },
  },
  created () {
    this::defineServices()
  },
  methods: {
    /**
     * @return {Promise<void>}
     * @protected
     */
    beforeInit () {
      return this::olCmp.methods.beforeInit()
    },
    /**
     * @return {OlStyle|Promise<OlStyle>}
     * @protected
     */
    async createOlObject () {
      return initializeStyle(await this.createStyle(), this.currentId)
    },
    /**
     * @return {OlStyle|Promise<OlStyle>}
     * @protected
     * @abstract
     */
    createStyle () {
      throw new Error(`${this.vmName} not implemented method: createStyle()`)
    },
    /**
     * @return {Promise<void>}
     */
    async mount () {
      await this::olCmp.methods.mount()
    },
    /**
     * @return {Promise<void>}
     */
    async unmount () {
      await this::olCmp.methods.unmount()
    },
    /**
     * @return {Promise<void>}
     */
    async remount () {
      await this::olCmp.methods.remount()
      await this.refresh()

      if (this.$mapVm) {
        await this.$mapVm.render()
      }
    },
    /**
     * @return {Promise<void>}
     */
    async refresh () {
      await this::olCmp.methods.refresh()
    },
    /**
     * @return {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(
        this::olCmp.methods.getServices(),
        {
          get styleVm () { return vm },
        },
      )
    },
    /**
     * @protected
     */
    subscribeAll () {
      this::olCmp.methods.subscribeAll()
    },
    /**
     * @param {string|number} id
     */
    setId (id) {
      assert(id != null && id !== '', 'Invalid id')

      if (this.currentId !== id) {
        this.currentId = id
        this.scheduleRefresh()
      }
      this.$olObject && this.setIdInternal(id)
    },
    /**
     * @returns {string|number}
     */
    getIdInternal () {
      return getStyleId(this.$style)
    },
    /**
     * @param {string|number} id
     * @returns {void}
     */
    setIdInternal (id) {
      if (id === this.getIdInternal()) return

      setStyleId(this.$style, id)
      this.scheduleRefresh()
    },
    /**
     * @return {Promise<OlStyle>}
     */
    resolveStyle: olCmp.methods.resolveOlObject,
    /**
     * @protected
     */
    syncNonObservable () {
      this::olCmp.methods.syncNonObservable()
    },
  },
}

function defineServices () {
  Object.defineProperties(this, {
    /**
     * @type {OlStyle|undefined}
     */
    $style: {
      enumerable: true,
      get: () => this.$olObject,
    },
    /**
     * @type {Object|undefined}
     */
    $styleContainer: {
      enumerable: true,
      get: () => this.$services?.styleContainer,
    },
  })
}
