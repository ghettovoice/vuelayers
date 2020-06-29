import debounce from 'debounce-promise'
import { get as getProj } from 'ol/proj'
import { map as mapObs, skipWhile } from 'rxjs/operators'
import { getSourceId, initializeSource, setSourceId } from '../ol-ext'
import {
  fromOlChangeEvent as obsFromOlChangeEvent,
  fromVueEvent as obsFromVueEvent,
  fromVueWatcher as obsFromVueWatcher,
} from '../rx-ext'
import { assert, addPrefix, hasProp, isArray, isEqual, isString, pick, mergeDescriptors, waitFor } from '../util'
import olCmp, { FRAME_TIME, OlObjectEvent } from './ol-cmp'
import projTransforms from './proj-transforms'
import stubVNode from './stub-vnode'

/**
 * Base source mixin.
 */
export default {
  mixins: [
    stubVNode,
    projTransforms,
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
    projection: {
      type: String,
      validator: value => !!getProj(value),
    },
    /**
     * @type {boolean}
     */
    wrapX: {
      type: Boolean,
      default: true,
    },
    /**
     * @type {string|undefined}
     */
    state: String,
  },
  data () {
    return {
      dataProjection: null,
    }
  },
  computed: {
    currentAttributions () {
      if (this.rev && this.$source) {
        return this.getAttributionsInternal()
      }

      return this.attributions
    },
    currentState () {
      if (this.rev && this.$source) {
        return this.getStateInternal()
      }

      return this.state
    },
  },
  watch: {
    async attributions (value) {
      await this.setAttributions(value)
    },
    currentAttributions: /*#__PURE__*/debounce(function (value) {
      if (isEqual(value, this.attributions)) return

      this.$emit('update:attributions', value)
    }, FRAME_TIME),
    async state (value) {
      await this.setState(value)
    },
    currentState: /*#__PURE__*/debounce(function (value) {
      this.$emit('update:state', value)
    }, FRAME_TIME),
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
     * @returns {Promise<void>}
     * @protected
     */
    async beforeInit () {
      try {
        await waitFor(
          () => this.$mapVm != null,
          obsFromVueEvent(this.$eventBus, [
            OlObjectEvent.CREATE_ERROR,
          ]).pipe(
            mapObs(([vm]) => hasProp(vm, '$map') && this.$vq.closest(vm)),
          ),
          1000,
        )
        this.dataProjection = this.$mapVm.resolvedDataProjection
        const dataProjChanges = obsFromVueWatcher(this, () => this.$mapVm.resolvedDataProjection)
        this.subscribeTo(dataProjChanges, ({ value }) => { this.dataProjection = value })
        await this.$nextTickPromise()

        return this::olCmp.methods.beforeInit()
      } catch (err) {
        err.message = 'Wait for $mapVm injection: ' + err.message
        throw err
      }
    },
    /**
     * @return {Promise<module:ol/source/Source~Source>}
     * @protected
     */
    async createOlObject () {
      return initializeSource(await this.createSource(), this.currentId)
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
     * @returns {Promise<void>}
     */
    async refresh () {
      const source = await this.resolveSource()

      return new Promise(resolve => {
        source.once('change', () => resolve())
        source.refresh()
      })
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
     * @returns {void}
     */
    subscribeAll () {
      this::olCmp.methods.subscribeAll()
      this::subscribeToSourceEvents()
    },
    .../*#__PURE__*/pick(olCmp.methods, [
      'init',
      'deinit',
      'beforeMount',
      'refresh',
      'scheduleRefresh',
      'remount',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'resolveOlObject',
    ]),
    /**
     * @return {Promise<module:ol/source/Source~Source>}
     */
    resolveSource: olCmp.methods.resolveOlObject,
    /**
     * @returns {string|number}
     */
    getIdInternal () {
      return getSourceId(this.$source)
    },
    /**
     * @param {string|number} id
     * @returns {void}
     */
    setIdInternal (id) {
      assert(id != null && id !== '', 'Invalid source id')

      if (id === this.getIdInternal()) return

      setSourceId(this.$source, id)
    },
    /**
     * @returns {Promise<string|string[]|undefined>}
     */
    async getAttributions () {
      await this.resolveSource()

      return this.getAttributionsInternal()
    },
    /**
     * @return {string|string[]|undefined}
     * @protected
     */
    getAttributionsInternal () {
      return this.$source.getAttributions()
    },
    /**
     * @param {string} attributions
     * @returns {Promise<void>}
     */
    async setAttributions (attributions) {
      if (isEqual(attributions, await this.getAttributions())) return

      (await this.resolveSource()).setAttributions(attributions)
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
      await this.resolveSource()

      return this.getStateInternal()
    },
    /**
     * @return {string}
     * @protected
     */
    getStateInternal () {
      return this.$source.getState()
    },
    /**
     * @param {string} state
     * @return {Promise<void>}
     */
    async setState (state) {
      if (state === await this.getState()) return

      (await this.resolveSource()).setState(state)
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
     * @type {Object|undefined}
     */
    $viewVm: {
      enumerable: true,
      get: () => this.$services?.viewVm,
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
  const prefixKey = addPrefix('current')
  const propChanges = obsFromOlChangeEvent(this.$source, [
    'id',
  ], true, evt => ({
    ...evt,
    compareWith: this[prefixKey(evt.prop)],
  })).pipe(
    skipWhile(({ value, compareWith }) => isEqual(value, compareWith)),
  )
  this.subscribeTo(propChanges, () => {
    ++this.rev
  })
}
