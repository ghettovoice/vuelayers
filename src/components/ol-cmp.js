/**
 * Basic ol component mixin
 * @module components/cmp
 */
import { debounce } from 'lodash/fp'
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
   * @return {Promise} Resolves when initialization completes
   * @protected
   */
  async init () {
    this.olObject = undefined
    if (this.ident && this.identMap.has(this.ident)) {
      this.olObject = this.identMap.get(this.ident)
    } else {
      /**
       * @type {*}
       * @protected
       */
      this.olObject = await Promise.resolve(this.createOlObject())
      if (this.ident) {
        this.identMap.set(this.ident, this.olObject)
      }
    }
    this.olObject[VM_PROP] || (this.olObject[VM_PROP] = [])
    if (!this.olObject[VM_PROP].includes(this)) { // for loaded from IdentityMap
      this.olObject[VM_PROP].push(this)
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
   * @return {void}
   * @protected
   */
  deinit () {
    if (this.ident) {
      this.identMap.unset(this.ident)
    }
    this.olObject[VM_PROP] = this.olObject[VM_PROP].filter(vm => vm !== this)
    this.olObject = undefined
  },
  /**
   * @protected
   * @return {void}
   */
  defineAccessors () {},
  /**
   * Redefine for easy call in child components
   * @returns {Object}
   * @protected
   */
  getServices () {
    return this::services.methods.getServices()
  },
  /**
   * @return {void}
   * @protected
   * @abstract
   */
  mount () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {void}
   * @protected
   * @abstract
   */
  unmount () {
    throw new Error('Not implemented method')
  },
  /**
   * @type {function():void}
   */
  requestRefresh: debounce(100, function () {
    this.refresh()
  }),
  /**
   * @return {void}
   */
  refresh () {},
  /**
   * @return {void}
   * @protected
   */
  subscribeAll () {}
}

export default {
  mixins: [identMap, rxSubs, services],
  props,
  methods,
  created () {
    this.defineAccessors()
    let parentReady = Promise.resolve(this.$parent && this.$parent.readyPromise)
    /**
     * @type {Promise<Vue<T>>}
     * @protected
     */
    this._readyPromise = parentReady.then(this.init)
      .then(() => {
        logdbg('created', this.$options.name)
        return this
      })
    /**
     * @type {Promise<Vue<T>>}
     * @protected
     */
    this._mountPromise = Observable.interval(100)
      .skipWhile(() => !this._mounted)
      .first()
      .map(() => this)
      .toPromise()

    Object.defineProperties(this, {
      readyPromise: {
        enumerable: true,
        get: () => this._readyPromise
      },
      mountPromise: {
        enumerable: true,
        get: () => this._mountPromise
      }
    })
  },
  mounted () {
    this.readyPromise.then(this.mount)
      .then(() => {
        this._mounted = true
        logdbg('mounted', this.$options.name)
      })
  },
  destroyed () {
    this.mountPromise.then(this.unmount)
      .then(this.deinit)
      .then(() => {
        this._readyPromise = this._mountPromise = undefined
        logdbg('destroyed', this.$options.name)
      })
  }
}
