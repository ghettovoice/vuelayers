import debounce from 'debounce-promise'
import { interval as intervalObs } from 'rxjs/observable'
import { first as firstObs, map as mapObs, skipWhile } from 'rxjs/operators'
import { log } from '../util/log'
import { isFunction } from '../util/minilo'
import identMap from './ident-map'
import rxSubs from './rx-subs'
import services from './services'

const VM_PROP = 'vm'
const INSTANCE_PROMISE_POOL = 'instance_promise'

/**
 * Basic ol component mixin.
 * todo try to subscribe to generic change event here and update rev according to internal ol counter
 */
export default {
  VM_PROP,
  INSTANCE_PROMISE_POOL,
  mixins: [identMap, rxSubs, services],
  data () {
    return {
      rev: 0,
    }
  },
  methods: {
    /**
     * @return {Promise<void>}
     * @protected
     */
    beforeInit () {},
    /**
     * @return {Promise<void>} Resolves when initialization completes
     * @protected
     */
    async init () {
      let createPromise

      const ident = this.makeSelfIdent()
      if (ident && this.$identityMap.has(ident, INSTANCE_PROMISE_POOL)) {
        createPromise = this.$identityMap.get(ident, INSTANCE_PROMISE_POOL)
      } else {
        createPromise = Promise.resolve(this.createOlObject())

        if (ident) {
          this.$identityMap.set(ident, createPromise, INSTANCE_PROMISE_POOL)
        }
      }

      this._olObject = await createPromise
      this._olObject[VM_PROP] || (this._olObject[VM_PROP] = [])

      if (!this._olObject[VM_PROP].includes(this)) { // for loaded from IdentityMap
        this._olObject[VM_PROP].push(this)
      }

      ++this.rev
    },
    /**
     * @return {module:ol/Object~BaseObject|Promise<module:ol/Object~BaseObject>}
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
      const ident = this.makeSelfIdent()
      if (ident) {
        this.$identityMap.unset(ident, INSTANCE_PROMISE_POOL)
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
     * @return {Promise<void>}
     */
    refresh () {
      if (this.$olObject == null) return Promise.resolve()

      return new Promise(resolve => {
        let done = () => {
          ++this.rev
          resolve()
        }
        if (this.$olObject && isFunction(this.$olObject.changed)) {
          this.$olObject.once('change', done)
          this.$olObject.changed()
        } else {
          done()
        }
      })
    },
    /**
     * Internal usage only in components that doesn't support refreshing.
     * @return {Promise<void>}
     * @protected
     */
    remount () {
      if (this.$olObject == null) return Promise.resolve()

      return Promise.resolve(this.unmount())
        .then(() => this.mount())
    },
    /**
     * Only for internal purpose to support watching for properties
     * for which OpenLayers doesn't provide setters.
     * @return {Promise}
     * @protected
     */
    recreate () {
      if (this.$olObject == null) return Promise.resolve()

      return Promise.resolve(this.unmount())
        .then(() => this.deinit())
        .then(() => this.init())
        .then(() => this.mount())
    },
  },
  created () {
    /**
     * @type {module:ol/Object~BaseObject}
     * @private
     */
    this._olObject = undefined
    Object.defineProperties(this, {
      $olObject: {
        enumerable: true,
        get: () => this._olObject,
      },
    })

    this::defineLifeCyclePromises()
    this::defineDebouncedHelpers()
  },
  mounted () {
    this.$createPromise.then(this.mount)
      .then(() => {
        this._mounted = true
        this.$emit('mounted', this)

        if (process.env.NODE_ENV !== 'production') {
          log('mounted', this.$options.name)
        }
      })
  },
  destroyed () {
    this.$mountPromise.then(this.unmount)
      .then(this.deinit)
      .then(() => {
        this._mounted = false
        this.$emit('destroyed', this)

        if (process.env.NODE_ENV !== 'production') {
          log('destroyed', this.$options.name)
        }
      })
  },
}

function defineLifeCyclePromises () {
  /**
   * @type {Promise<Vue<T>>}
   * @private
   */
  this._createPromise = Promise.resolve(this.beforeInit())
    .then(this.init)
    .then(() => {
      this.$emit('created', this)

      if (process.env.NODE_ENV !== 'production') {
        log('create', this.$options.name)
      }

      return this
    })
  /**
   * @type {Promise<Vue<T>>}
   * @private
   */
  this._mountPromise = intervalObs(100).pipe(
    skipWhile(() => !this._mounted),
    firstObs(),
    mapObs(() => this),
  ).toPromise(Promise)

  Object.defineProperties(this, {
    $createPromise: {
      enumerable: true,
      get: () => this._createPromise,
    },
    $mountPromise: {
      enumerable: true,
      get: () => this._mountPromise,
    },
  })
}

function defineDebouncedHelpers () {
  // bind debounced functions at runtime
  // for each instance to avoid interfering between
  // different instances
  this.scheduleRefresh = debounce(function () {
    return this.refresh()
  }, 10)
  this.scheduleRemount = debounce(function () {
    return this.remount()
  }, 10)
  this.scheduleRecreate = debounce(function () {
    return this.recreate()
  }, 10)
}
