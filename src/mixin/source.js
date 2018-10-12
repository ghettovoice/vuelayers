import { isFunction } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import cmp from './ol-virt-cmp'
import useMapCmp from './use-map-cmp'

const props = {
  attributions: [String, Array],
  logo: String,
  projection: String,
  wrapX: {
    type: Boolean,
    default: true,
  },
}

const methods = {
  /**
   * @return {Source|Promise<Source>}
   * @protected
   */
  createOlObject () {
    return this.createSource()
  },
  /**
   * @return {Source|Promise<Source>}
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
}

const watch = {
  attributions (value) {
    this.$source && this.$source.setAttributions(value)
  },
}

export default {
  mixins: [cmp, useMapCmp],
  props,
  methods,
  watch,
  stubVNode: {
    empty () {
      return this.$options.name
    },
  },
  created () {
    Object.defineProperties(this, {
      /**
       * @type {Source|undefined}
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
}
