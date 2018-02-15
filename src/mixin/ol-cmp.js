/**
 * @module mixin/ol-cmp
 */
import { isFunction } from 'lodash/fp'
import { Observable } from 'rxjs'
import { interval as intervalObs } from 'rxjs/observable'
import { first as firstObs, map as mapObs, skipWhile, toPromise } from 'rxjs/operator'
import { VM_PROP } from '../consts'
import identMap from './ident-map'
import rxSubs from './rx-subs'
import services from './services'
import options from './options'

const props = {}

const INSTANCE_PROMISE = 'instancePromise'
const methods = {
  /**
   * @return {Promise<void>}
   * @protected
   */
  beforeInit () {},
  /**
   * @return {Promise} Resolves when initialization completes
   * @protected
   */
  async init () {
    let createPromise

    const ident = this.getFullIdent(INSTANCE_PROMISE)
    if (ident && this.$identityMap.has(ident)) {
      createPromise = this.$identityMap.get(ident)
    } else {
      createPromise = Promise.resolve(this.createOlObject())

      if (ident) {
        this.$identityMap.set(ident, createPromise)
      }
    }

    this._olObject = await createPromise
    this._olObject[VM_PROP] || (this._olObject[VM_PROP] = [])

    if (!this._olObject[VM_PROP].includes(this)) { // for loaded from IdentityMap
      this._olObject[VM_PROP].push(this)
    }

    this.rev++
  },
  /**
   * @return {*|Promise<T>}
   * @protected
   * @abstract
   */
  createOlObject () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {void|Promise<void>}
   * @protected
   */
  deinit () {
    const ident = this.getFullIdent(INSTANCE_PROMISE)
    if (ident) {
      this.$identityMap.unset(ident)
    }
    if (this._olObject) {
      this._olObject[VM_PROP] = this._olObject[VM_PROP].filter(vm => vm !== this)
      this._olObject = undefined
    }
  },
  /**
   * Redefine for easy call in child components
   * @returns {Object}
   * @protected
   */
  getServices () {
    return this::services.methods.getServices()
  },
  /**
   * @return {void|Promise<void>}
   * @protected
   * @abstract
   */
  mount () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {void|Promise<void>}
   * @protected
   * @abstract
   */
  unmount () {
    throw new Error('Not implemented method')
  },
  /**
   * Refresh internal ol objects
   * @return {Promise}
   */
  refresh: refresh,
}

/**
 * Basic ol component mixin.
 *
 * @title olCmp
 * @vueProto
 * @alias module:core/mixin/ol-cmp
 *
 * @fires module:core/mixin/ol-cmp#created
 * @fires module:core/mixin/ol-cmp#mounted
 * @fires module:core/mixin/ol-cmp#destroyed
 */
export default {
  mixins: [options, identMap, rxSubs, services],
  props,
  methods,
  /**
   * @this module:core/mixin/ol-cmp
   */
  data () {
    return /** @lends module:core/mixin/ol-cmp# */{
      rev: 0,
    }
  },
  created () {
    /**
     * @type {*}
     * @private
     */
    this._olObject = undefined
    /**
     * @type {Promise<Vue<T>>}
     * @private
     */
    this._createPromise = Promise.resolve(this.beforeInit())
      .then(this.init)
      .then(() => {
        // logdbg('created', this.$options.name)
        this.$emit('created')
        return this
      })
    /**
     * @type {Promise<Vue<T>>}
     * @private
     */
    this._mountPromise = Observable::intervalObs(100)
      ::skipWhile(() => !this._mounted)
      ::firstObs()
      ::mapObs(() => this)
      ::toPromise(Promise)

    Object.defineProperties(this, {
      $olObject: {
        enumerable: true,
        get: () => this._olObject,
      },
      $createPromise: {
        enumerable: true,
        get: () => this._createPromise,
      },
      $mountPromise: {
        enumerable: true,
        get: () => this._mountPromise,
      },
    })
  },
  mounted () {
    this.$createPromise.then(this.mount)
      .then(() => {
        this._mounted = true
        this.$emit('mounted')
        // logdbg('mounted', this.$options.name)
      })
  },
  destroyed () {
    this.$mountPromise.then(this.unmount)
      .then(this.deinit)
      .then(() => {
        this.$emit('destroyed')
        this._olObject = this._createPromise = this._mountPromise = undefined
        // logdbg('destroyed', this.$options.name)
      })
  },
}

/**
 * @return {Promise<void>}
 */
function refresh () {
  return new Promise(resolve => {
    if (this.$olObject && isFunction(this.$olObject.changed)) {
      this.$olObject.once('change', () => resolve())
      this.$olObject.changed()
    } else {
      resolve()
    }
  })
}

/**
 * Emitted when underlying **OpenLayers** instance created.
 * @event module:core/mixin/ol-cmp#created
 * @type {void}
 */
/**
 * Emitted when underlying **OpenLayers** instance mounted to parent.
 * @event module:core/mixin/ol-cmp#mounted
 * @type {void}
 */
/**
 * Emitted when underlying **OpenLayers** instance destroyed.
 * @event module:core/mixin/ol-cmp#destroyed
 * @type {void}
 */
