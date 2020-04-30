import { get as getProj } from 'ol/proj'
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
      validator: value => isString(value) ||
        (isArray(value) && value.every(isString)),
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
    projection: {
      type: String,
      validator: value => getProj(value) != null,
    },
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

      try {
        return this.$source.getResolutions()
      } catch (err) {
        return []
      }
    },
  },
  watch: {
    async id (value) {
      await this.setId(value)
    },
    async attributions (value) {
      await this.setAttributions(value)
    },
    async attributionsCollapsible (value) {
      if (value === await this.getAttributionsCollapsible()) return

      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log('attributionsCollapsible changed, scheduling recreate...')
      }

      await this.scheduleRecreate()
    },
    async projection (value) {
      const projection = await this.getProjection()
      if (value === projection?.getCode()) return

      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log('projection changed, scheduling recreate...')
      }

      await this.scheduleRecreate()
    },
    async wrapX (value) {
      if (value === await this.getWrapX()) return

      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log('wrapX changed, scheduling recreate...')
      }

      await this.scheduleRecreate()
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
      return initializeSource(await this.createSource(), this.id)
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
    async getId () {
      return (await this.resolveSource()).getId()
    },
    /**
     * @param {string|number} id
     * @returns {Promise<void>}
     */
    async setId (id) {
      const source = await this.resolveSource()

      if (id === getSourceId(source)) return

      setSourceId(source, id)
    },
    /**
     * @returns {Promise<string>}
     */
    async getAttributions () {
      return (await this.resolveSource()).getAttributions()
    },
    /**
     * @param {string} attributions
     * @returns {Promise<void>}
     */
    async setAttributions (attributions) {
      const source = await this.resolveSource()

      if (isEqual(attributions, source.getAttributions())) return

      source.setAttributions(attributions)
    },
    /**
     * @returns {Promise<boolean>}
     */
    async getAttributionsCollapsible () {
      return (await this.resolveSource()).getAttributionsCollapsible()
    },
    /**
     * @returns {Promise<module:ol/proj/Projection~Projection>}
     */
    async getProjection () {
      return (await this.resolveSource()).getProjection()
    },
    /**
     * @returns {Promise<string>}
     */
    async getState () {
      return (await this.resolveSource()).getState()
    },
    /**
     * @returns {Promise<boolean>}
     */
    async getWrapX () {
      return (await this.resolveSource()).getWrapX()
    },
    /**
     * @returns {Promise<number[]>}
     */
    async getResolutions () {
      return (await this.resolveSource()).getResolutions()
    },
    /**
     * @returns {Promise<void>}
     */
    async reload () {
      (await this.resolveSource()).refresh()
    },
    /**
     * @return {Promise<void>}
     */
    async clear () {
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
      await Promise.all([
        this::olCmp.methods.subscribeAll(),
        this::subscribeToSourceEvents(),
      ])
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
      'resolveOlObject',
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
