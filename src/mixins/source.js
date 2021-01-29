import { get as getProj } from 'ol/proj'
import SourceState from 'ol/source/State'
import { EPSG_3857, getSourceId, initializeSource, setSourceId } from '../ol-ext'
import { assert, coalesce, isArray, isEqual, isFunction, isString, mergeDescriptors, or } from '../utils'
import olCmp, { makeChangeOrRecreateWatchers } from './ol-cmp'
import projTransforms from './proj-transforms'
import stubVNode from './stub-vnode'
import waitForMap from './wait-for-map'

const validateAttributions = /*#__PURE__*/or(isString, isFunction, value => isArray(value) && value.every(isString))

/**
 * Base source mixin.
 */
export default {
  mixins: [
    stubVNode,
    projTransforms,
    olCmp,
    waitForMap,
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
      type: [String, Array, Function],
      validator: validateAttributions,
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
    state: {
      type: String,
      default: SourceState.READY,
      validator: value => Object.values(SourceState).includes(value),
    },
  },
  data () {
    return {
      viewProjection: EPSG_3857,
      dataProjection: EPSG_3857,
      currentAttributions: adaptAttributions(this.attributions),
      currentState: this.state,
    }
  },
  computed: {
    inputAttributions () {
      return adaptAttributions(this.attributions)
    },
    currentResolutions () {
      return this.rev ? this.getResolutions() : []
    },
    resolvedDataProjection () {
      return coalesce(
        this.projection,
        this.dataProjection, // may or may not be present
        this.$options?.dataProjection, // may or may not be present
        this.resolvedViewProjection,
      )
    },
  },
  watch: {
    rev () {
      if (!this.$source) return

      if (this.currentAttributions !== this.$source.getAttributions()) {
        this.currentAttributions = this.$source.getAttributions()
      }
      if (this.currentState !== this.$source.getState()) {
        this.currentState = this.$source.getState()
      }
    },
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'inputAttributions',
      'currentAttributions',
      'state',
      'currentState',
      'attributionsCollapsible',
      'projection',
      'wrapX',
      'currentResolutions',
    ], [
      'inputAttributions',
      'currentAttributions',
      'currentResolutions',
    ]),
  },
  created () {
    this::defineServices()
  },
  methods: {
    /**
     * @return {Promise<void>}
     * @protected
     */
    async beforeInit () {
      await Promise.all([
        this::olCmp.methods.beforeInit(),
        this::waitForMap.methods.beforeInit(),
      ])
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
      throw new Error(`${this.vmName} not implemented method: createSource()`)
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async mount () {
      this.$sourceContainer?.setSource(this)

      return this::olCmp.methods.mount()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async unmount () {
      if (this.$sourceContainer?.getSourceVm() === this) {
        this.$sourceContainer.setSource(null)
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
     * @protected
     */
    subscribeAll () {
      this::olCmp.methods.subscribeAll()
      this::subscribeToSourceEvents()
    },
    /**
     * @returns {string|number}
     * @protected
     */
    getIdInternal () {
      return getSourceId(this.$source)
    },
    /**
     * @param {string|number} id
     * @protected
     */
    setIdInternal (id) {
      if (id === this.getIdInternal()) return

      setSourceId(this.$source, id)
    },
    /**
     * @return {Promise<module:ol/source/Source~Source>}
     */
    resolveSource: olCmp.methods.resolveOlObject,
    /**
     * @returns {string|string[]|undefined}
     */
    getAttributions () {
      return coalesce(this.$source?.getAttributions(), this.currentAttributions)
    },
    /**
     * @param {string} attributions
     */
    setAttributions (attributions) {
      assert(!attributions || validateAttributions(attributions), 'Invalid attributions')
      attributions = adaptAttributions(attributions)

      if (!isEqual(attributions, this.currentAttributions)) {
        this.currentAttributions = attributions
      }
      if (this.$source && !isEqual(attributions, this.$source.getAttributions())) {
        this.$source.setAttributions(attributions)
      }
    },
    /**
     * @returns {boolean}
     */
    getAttributionsCollapsible () {
      return coalesce(this.$source?.getAttributionsCollapsible(), this.attributionsCollapsible)
    },
    /**
     * @returns {module:ol/proj/Projection~Projection}
     */
    getProjection () {
      return coalesce(this.$source?.getProjection(), getProj(this.resolvedDataProjection))
    },
    /**
     * @returns {string}
     */
    getState () {
      return coalesce(this.$source?.getState(), this.currentState)
    },
    /**
     * @returns {boolean}
     */
    getWrapX () {
      return coalesce(this.$source?.getWrapX(), this.wrapX)
    },
    /**
     * @returns {number[]}
     */
    getResolutions () {
      try {
        // can be not implemented in source class
        return coalesce(this.$source?.getResolutions(), [])
      } catch (err) {
        return []
      }
    },
    /**
     * @param {string|string[]|Function|undefined} value
     * @protected
     */
    inputAttributionsChanged (value) {
      this.setAttributions(value)
    },
    /**
     * @param {string|string[]|Function|undefined} value
     * @protected
     */
    currentAttributionsChanged (value) {
      if (isEqual(value, this.inputAttributions)) return

      this.$emit('update:attributions', value)
    },
    /**
     * @param {string} value
     * @protected
     */
    stateChanged (value) {
      if (value === this.currentState) return

      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log('state changed, scheduling recreate... %O ===> %O',
          this.currentState, value)
      }

      this.currentState = value

      return this.scheduleRecreate()
    },
    /**
     * @param {string} value
     * @protected
     */
    currentStateChanged (value) {
      if (value === this.state) return

      this.$emit('update:state', value)
    },
    /**
     * @param {number[]} value
     * @param {number[]} prev
     * @protected
     */
    currentResolutionsChanged (value, prev) {
      if (isEqual(value, prev)) return

      this.$emit('update:resolutions', value?.slice())
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

function subscribeToSourceEvents () {
}

function adaptAttributions (attributions) {
  if (!attributions) return
  if (isFunction(attributions)) return attributions

  return () => isArray(attributions) ? attributions : [attributions]
}
