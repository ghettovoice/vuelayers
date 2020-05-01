import { getStyleId, initializeStyle, setStyleId } from '../ol-ext'
import { pick, waitFor } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
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
  watch: {
    async id (value) {
      await this.setId(value)
    },
  },
  created () {
    this::defineServices()
  },
  methods: {
    /**
     * @return {OlStyle|Promise<OlStyle>}
     * @protected
     */
    async createOlObject () {
      return initializeStyle(await this.createStyle(), this.id)
    },
    /**
     * @return {OlStyle|Promise<OlStyle>}
     * @protected
     * @abstract
     */
    createStyle () {
      throw new Error('Not implemented method: createStyle')
    },
    /**
     * @returns {Promise<string|number|undefined>}
     */
    async getId () {
      return getStyleId(await this.resolveStyle())
    },
    /**
     * @param {string|number|undefined} id
     * @returns {Promise<void>}
     */
    async setId (id) {
      const style = await this.resolveStyle()

      if (id === getStyleId(style)) return

      setStyleId(style, id)
    },
    /**
     * @returns {Promise<void>}
     * @protected
     */
    async init () {
      await waitFor(() => this.$mapVm != null)

      return this::olCmp.methods.init()
    },
    /**
     * @return {Promise<void>}
     */
    async remount () {
      await this::olCmp.methods.remount()

      if (this.$mapVm) {
        await this.$mapVm.render()
      }
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
     * @return {Promise<OlStyle>}
     */
    resolveStyle: olCmp.methods.resolveOlObject,
    ...pick(olCmp.methods, [
      'deinit',
      'mount',
      'unmount',
      'refresh',
      'scheduleRefresh',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'subscribeAll',
      'resolveOlObject',
    ]),
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
    $mapVm: {
      enumerable: true,
      get: () => this.$services?.mapVm,
    },
    /**
     * @type {Object|undefined}
     */
    $viewVm: {
      enumerable: true,
      get: () => this.$services?.viewVm,
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
