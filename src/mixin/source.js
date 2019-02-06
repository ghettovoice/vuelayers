import { isArray, isEqual, isFunction, isString } from '../util/minilo'
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
    createOlObject () {
      return this.createSource()
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
      if (this.$source && !isFunction(this.$source.clear)) {
        return this::cmp.methods.refresh()
      }

      return new Promise(resolve => {
        let done = () => {
          ++this.rev
          resolve()
        }
        if (this.$source) {
          this.$source.once('change', done)
          this.$source.clear()
        } else {
          done()
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
      return this::cmp.methods.remount()
    },
    /**
     * @protected
     */
    subscribeAll () {
      this::cmp.methods.subscribeAll()
    },
  },
  watch: {
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
      return this.$options.name
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
