import { getSourceId, initializeSource, setSourceId } from '../ol-ext'
import { obsFromOlChangeEvent } from '../rx-ext'
import { isArray, isEqual, isString, pick, waitFor } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import olCmp from './ol-cmp'
import stubVNode from './stub-vnode'

/**
 * Base source mixin.
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
  props: {
    // ol/source/Source
    /**
     * @type {string|string[]|undefined}
     */
    attributions: {
      type: [String, Array],
      validator: value => isString(value) || (isArray(value) && value.every(isString)),
    },
    /**
     * @type {boolean}
     */
    attributionsCollapsible: {
      type: Boolean,
      default: true,
    },
    /**
     * @type {string|undefined}
     */
    projection: String,
    /**
     * @type {boolean}
     */
    wrapX: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    /**
     * @returns {string|undefined}
     */
    state () {
      if (!(this.rev && this.$source)) return

      return this.$source.getState()
    },
    /**
     * @returns {number[]|undefined}
     */
    resolutions () {
      if (!(this.rev && this.$source)) return

      return this.$source.getResolutions() || []
    },
  },
  watch: {
    id (value) {
      this.setSourceId(value)
    },
    attributions (value) {
      this.setSourceAttributions(value)
    },
    async attributionsCollapsible (value) {
      if (value === await this.getSourceAttributionsCollapsible()) return

      this.scheduleRecreate()
    },
    async projection (value) {
      const projection = await this.getSourceProjection()
      if (value === projection?.getCode()) return

      this.scheduleRecreate()
    },
    async wrapX (value) {
      if (value === await this.getSourceWrapX()) return

      this.scheduleRecreate()
    },
  },
  created () {
    this::defineServices()
  },
  methods: {
    /**
     * @return {Promise<module:ol/source/Source~Source>}
     * @protected
     */
    async createOlObject () {
      const source = await this.createSource()

      initializeSource(source, this.id)

      return source
    },
    /**
     * @return {module:ol/source/Source~Source|Promise<module:ol/source/Source~Source>}
     * @protected
     * @abstract
     */
    createSource () {
      throw new Error('Not implemented method: createSource')
    },
    /**
     * @returns {Promise<string|number>}
     */
    async getSourceId () {
      return (await this.resolveSource()).getId()
    },
    /**
     * @param {string|number} id
     * @returns {Promise<void>}
     */
    async setSourceId (id) {
      const source = await this.resolveSource()

      if (id === getSourceId(source)) return

      setSourceId(source, id)
    },
    /**
     * @returns {Promise<string>}
     */
    async getSourceAttributions () {
      return (await this.resolveSource()).getAttributions()
    },
    /**
     * @param {string} attributions
     * @returns {Promise<void>}
     */
    async setSourceAttributions (attributions) {
      const source = await this.resolveSource()

      if (isEqual(attributions, source.getAttributions())) return

      source.setAttributions(attributions)
    },
    /**
     * @returns {Promise<boolean>}
     */
    async getSourceAttributionsCollapsible () {
      return (await this.resolveSource()).getAttributionsCollapsible()
    },
    /**
     * @returns {Promise<module:ol/proj/Projection~Projection>}
     */
    async getSourceProjection () {
      return (await this.resolveSource()).getProjection()
    },
    /**
     * @returns {Promise<string>}
     */
    async getSourceState () {
      return (await this.resolveSource()).getState()
    },
    /**
     * @returns {Promise<boolean>}
     */
    async getSourceWrapX () {
      return (await this.resolveSource()).getWrapX()
    },
    /**
     * @returns {Promise<number[]>}
     */
    async getSourceResolutions () {
      return (await this.resolveSource()).getResolutions()
    },
    /**
     * @returns {Promise<void>}
     */
    async reloadSource () {
      (await this.resolveSource()).refresh()
    },
    /**
     * @return {Promise<void>}
     */
    async clearSource () {
      (await this.resolveSource()).clear()
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
     * @protected
     */
    async mount () {
      if (this.$sourceContainer) {
        await this.$sourceContainer.setSource(this)
      }

      return this::olCmp.methods.mount()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async unmount () {
      if (this.$sourceContainer) {
        await this.$sourceContainer.setSource(null)
      }

      return this::olCmp.methods.unmount()
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
          get sourceVm () { return vm },
        },
      )
    },
    /**
     * @returns {Promise<void>}
     */
    async subscribeAll () {
      await Promise.all(
        this::olCmp.methods.subscribeAll(),
        this::subscribeToSourceEvents(),
      )
    },
    /**
     * @return {Promise<module:ol/source/Source~Source>}
     */
    resolveSource: olCmp.methods.resolveOlObject,
    ...pick(olCmp.methods, [
      'deinit',
      'refresh',
      'scheduleRefresh',
      'remount',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
    ]),
  },
}

function defineServices () {
  Object.defineProperties(this, {
    /**
     * @type {module:ol/source/Source~Source|undefined}
     */
    $source: {
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
     * @type {module:ol/View~View|undefined}
     */
    $view: {
      enumerable: true,
      get: () => this.$mapVm?.$view,
    },
    /**
     * @type {Object|undefined}
     */
    $sourceContainer: {
      enumerable: true,
      get: () => this.$services?.sourceContainer,
    },
  })
}

async function subscribeToSourceEvents () {
  const source = await this.resolveSource()

  const changes = obsFromOlChangeEvent(source, [
    'id',
  ], true, 1000 / 60)

  this.subscribeTo(changes, ({ prop, value }) => {
    ++this.rev

    this.$nextTick(() => {
      this.$emit(`update:${prop}`, value)
    })
  })
}
