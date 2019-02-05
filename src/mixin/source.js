import { isEqual, isFunction, isString, isArray } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import { makeWatchers } from '../util/vue-helpers'
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
      if (this.rev && this.$source) {
        return this.$source.getState()
      }
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
     * @return {void}
     * @protected
     */
    mount () {
      this.$sourceContainer && this.$sourceContainer.setSource(this)
      this.subscribeAll()
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.unsubscribeAll()
      this.$sourceContainer && this.$sourceContainer.setSource(undefined)
    },
    /**
     * @return {Promise<void>}
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
    defineServices () {
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
    },
  },
  watch: {
    attributions (value) {
      if (!this.$source) return

      this.$source.setAttributions(value)
    },
    ...makeWatchers([
      'attributionsCollapsible',
      'projection',
      'wrapX',
    ], () => function (value, prevValue) {
      if (isEqual(value, prevValue)) return

      this.scheduleRecreate()
    }),
  },
  stubVNode: {
    empty () {
      return this.$options.name
    },
  },
  created () {
    this.defineServices()
  },
}
