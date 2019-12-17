import { getSourceId, initializeSource, setSourceId } from '../ol-ext'
import { isArray, isEqual, isString } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import cmp from './ol-virt-cmp'
import useMapCmp from './use-map-cmp'

export default {
  mixins: [cmp, useMapCmp],
  props: {
    attributions: {
      type: [String, Array],
      validator: value => isString(value) || (isArray(value) && value.every(isString)),
    },
    attributionsCollapsible: {
      type: Boolean,
      default: true,
    },
    projection: String,
    wrapX: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    state () {
      if (!this.rev || !this.$source) {
        return
      }

      return this.$source.getState()
    },
  },
  methods: {
    /**
     * @return {module:ol/source/Source~Source|Promise<module:ol/source/Source~Source>}
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
      throw new Error('Not implemented method')
    },
    /**
     * @return {Promise|void}
     * @protected
     */
    init () {
      return this::cmp.methods.init()
    },
    /**
     * @return {Promise|void}
     * @protected
     */
    deinit () {
      return this::cmp.methods.deinit()
    },
    /**
     * @return {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(this::cmp.methods.getServices(), {
        get source () { return vm.$source },
      })
    },
    /**
     * @return {Promise|void}
     * @protected
     */
    mount () {
      this.$sourceContainer && this.$sourceContainer.setSource(this)

      return this::cmp.methods.mount()
    },
    /**
     * @return {Promise|void}
     * @protected
     */
    unmount () {
      this.$sourceContainer && this.$sourceContainer.setSource(undefined)

      return this::cmp.methods.unmount()
    },
    /**
     * @return {Promise}
     */
    refresh () {
      if (!this.$source) return Promise.resolve()

      return new Promise(resolve => {
        if (this.$source) {
          this.$source.once('change', () => resolve)
          this.$source.refresh()
        } else {
          resolve()
        }
      })
    },
    /**
     * Internal usage only in components that doesn't support refreshing.
     * @return {Promise}
     * @protected
     */
    remount () {
      return this::cmp.methods.remount()
    },
    /**
     * Internal usage only in components that doesn't support refreshing.
     * @return {Promise}
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
  watch: {
    id (value) {
      if (!this.$source || value === getSourceId(this.$source)) {
        return
      }

      setSourceId(this.$source, value)
    },
    attributions (value) {
      if (!this.$source || isEqual(value, this.$source.getAttributions())) {
        return
      }

      this.$source.setAttributions(value)
    },
    attributionsCollapsible (value) {
      if (!this.$source || value === this.$source.getAttributionsCollapsible()) {
        return
      }

      this.scheduleRecreate()
    },
    projection (value) {
      if (
        !this.$source ||
        (this.$source.getProjection() && value === this.$source.getProjection().getCode())
      ) {
        return
      }

      this.scheduleRecreate()
    },
    wrapX (value) {
      if (!this.$source || value === this.$source.getWrapX()) {
        return
      }

      this.scheduleRecreate()
    },
  },
  stubVNode: {
    empty () {
      return this.vmId
    },
  },
  created () {
    this::defineServices()
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
    $map: {
      enumerable: true,
      get: () => this.$services && this.$services.map,
    },
    $view: {
      enumerable: true,
      get: () => this.$services && this.$services.view,
    },
    $sourceContainer: {
      enumerable: true,
      get: () => this.$services && this.$services.sourceContainer,
    },
  })
}
