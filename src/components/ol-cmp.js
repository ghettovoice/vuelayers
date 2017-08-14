/**
 * Basic ol component mixin
 * @module components/ol-cmp
 */
import debounce from 'debounce-promise'
import { isFunction } from 'lodash/fp'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/interval'
import 'rxjs/add/operator/skipWhile'
import 'rxjs/add/operator/first'
import 'rxjs/add/operator/toPromise'
import rxSubs from './rx-subs'
import services from './services'
import identMap from './ident-map'
import { VM_PROP } from '../consts'
import { logdbg } from '../utils/debug'

const props = {}

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
    if (this.ident && this.$identityMap.has(this.ident)) {
      this._olObject = this.$identityMap.get(this.ident)
    } else {
      /**
       * @type {*}
       * @protected
       */
      this._olObject = await this.createOlObject()
      if (this.ident) {
        this.$identityMap.set(this.ident, this._olObject)
      }
    }
    this._olObject[VM_PROP] || (this._olObject[VM_PROP] = [])
    if (!this._olObject[VM_PROP].includes(this)) { // for loaded from IdentityMap
      this._olObject[VM_PROP].push(this)
    }
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
    if (this.ident) {
      this.$identityMap.unset(this.ident)
    }
    this._olObject[VM_PROP] = this._olObject[VM_PROP].filter(vm => vm !== this)
    this._olObject = undefined
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
   * Debounced refresh
   * @return {Promise}
   */
  requestRefresh: debounce(function () {
    return this.refresh()
  }, 100),
  /**
   * Refresh internal ol objects
   * @return {Promise}
   */
  refresh: refresh
}

export default {
  mixins: [identMap, rxSubs, services],
  props,
  methods,
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
        logdbg('created', this.$options.name)
        return this
      })
    /**
     * @type {Promise<Vue<T>>}
     * @private
     */
    this._mountPromise = Observable.interval(100)
      .skipWhile(() => !this._mounted)
      .first()
      .map(() => this)
      .toPromise()

    Object.defineProperties(this, {
      $olObject: {
        enumerable: true,
        get: () => this._olObject
      },
      $createPromise: {
        enumerable: true,
        get: () => this._createPromise
      },
      $mountPromise: {
        enumerable: true,
        get: () => this._mountPromise
      }
    })
  },
  mounted () {
    this.$createPromise.then(this.mount)
      .then(() => {
        this._mounted = true
        logdbg('mounted', this.$options.name)
      })
  },
  destroyed () {
    this.$mountPromise.then(this.unmount)
      .then(this.deinit)
      .then(() => {
        this._createPromise = this._mountPromise = undefined
        logdbg('destroyed', this.$options.name)
      })
  }
}

/**
 * @return {Promise<void>}
 */
function refresh () {
  return Promise.resolve(resolve => {
    if (this.$olObject && isFunction(this.$olObject.changed)) {
      this.$olObject.once('change', () => resolve())
      this.$olObject.changed()
    } else {
      resolve()
    }
  })
}
