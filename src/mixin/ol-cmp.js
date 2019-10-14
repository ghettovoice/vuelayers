import debounce from 'debounce-promise'
import { interval as intervalObs } from 'rxjs/observable'
import { first as firstObs, skipUntil, skipWhile } from 'rxjs/operators'
import uuid from 'uuid/v4'
import { log } from '../util/log'
import { identity, isFunction, kebabCase } from '../util/minilo'
import identMap from './ident-map'
import rxSubs from './rx-subs'
import services from './services'

const VM_PROP = 'vm'
const INSTANCE_PROMISE_POOL = 'instance_promise'

const STATE_UNDEF = 0
const STATE_CREATED = 1
const STATE_MOUNTED = 2

/**
 * Basic ol component mixin.
 * todo try to subscribe to generic change event here and update rev according to internal ol counter
 */
export default {
  VM_PROP,
  INSTANCE_PROMISE_POOL,
  mixins: [identMap, rxSubs, services],
  props: {
    id: {
      type: [String, Number],
      default: uuid,
    },
  },
  data () {
    return {
      rev: 0,
    }
  },
  computed: {
    vmClass () {
      return kebabCase(this.$options.name)
    },
    vmId () {
      return [this.vmClass, this.id].filter(identity).join('-')
    },
    vmName () {
      return [this.$options.name, this.id].filter(identity).join(' ')
    },
  },
  methods: {
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
        createPromise = this.createOlObject()

        if (ident) {
          this.$identityMap.set(ident, createPromise, INSTANCE_PROMISE_POOL)
        }
      }

      this._olObject = await createPromise
      this._olObject[VM_PROP] || (this._olObject[VM_PROP] = [])

      // for loaded from IdentityMap
      if (!this._olObject[VM_PROP].includes(this)) {
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
     */
    mount () {
      return this.subscribeAll()
    },
    /**
     * @return {void|Promise<void>}
     * @protected
     */
    unmount () {
      return this.unsubscribeAll()
    },
    /**
     * Refresh internal ol objects
     * @return {Promise<void>}
     */
    async refresh () {
      const olObj = await this.resolveOlObject()

      return new Promise(resolve => {
        if (isFunction(olObj.changed)) {
          olObj.once('change', () => resolve())
          olObj.changed()
        } else {
          resolve()
        }
      })
    },
    /**
     * Internal usage only in components that doesn't support refreshing.
     * @return {Promise<void>}
     * @protected
     */
    async remount () {
      const state = await this.resolveOlObjectState()

      if (state === STATE_MOUNTED) {
        await this.unmount()
      }

      await this.mount()
    },
    /**
     * Only for internal purpose to support watching for properties
     * for which OpenLayers doesn't provide setters.
     * @return {Promise}
     * @protected
     */
    async recreate () {
      const state = await this.resolveOlObjectState()

      if (state === STATE_MOUNTED) {
        await this.unmount()
        await this.deinit()
      }

      await this.init()
      await this.mount()
    },
    /**
     * @return {void|Promise<void>}
     */
    subscribeAll () {},
    /**
     * @returns {Promise<Object>}
     * @throws {Error} If underlying OpenLayers object not initialized (incorrect initialization, already destroy).
     */
    async resolveOlObject () {
      await this.$createPromise

      return this.$olObject || throw new Error('OpenLayers object is undefined')
    },
    /**
     * @returns {Promise<number>}
     * @protected
     */
    resolveOlObjectState () {
      return Promise.race([
        this.$createPromise.then(() => STATE_CREATED),
        this.$mountPromise.then(() => STATE_MOUNTED),
        this.$unmountPromise.then(() => STATE_CREATED),
        this.$destroyPromise.then(() => STATE_UNDEF),
      ])
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
  async mounted () {
    await this.$createPromise

    this._mounted = true
  },
  async beforeDestroy () {
    await this.$mountPromise

    this._mounted = false
  },
  async destroyed () {
    await this.$unmountPromise

    this._destroyed = true
  },
}

function defineLifeCyclePromises () {
  const makeEventEmitter = event => () => {
    this.$emit(event, this)

    if (process.env.VUELAYERS_DEBUG) {
      log(event, this.vmName)
    }

    return this
  }
  // create
  this._createPromise = Promise.resolve(this.init())
    .then(makeEventEmitter('created'))

  const t = 1000 / 60
  // mount
  const mountObs = intervalObs(t)
    .pipe(
      skipWhile(() => !this._mounted),
      firstObs(),
    )
  this._mountPromise = mountObs.toPromise(Promise)
    .then(::this.mount)
    .then(makeEventEmitter('mounted'))

  // unmount
  const unmountObs = intervalObs(t)
    .pipe(
      skipUntil(mountObs),
      skipWhile(() => this._mounted),
      firstObs(),
    )
  this._unmountPromise = unmountObs.toPromise(Promise)
    .then(::this.unmount)
    .then(makeEventEmitter('unmounted'))

  // destroy
  const destroyObs = intervalObs(t)
    .pipe(
      skipWhile(() => !this._destroyed),
      firstObs(),
    )
  this._destroyPromise = destroyObs.toPromise(Promise)
    .then(::this.deinit)
    .then(makeEventEmitter('destroyed'))

  Object.defineProperties(this, {
    $createPromise: {
      enumerable: true,
      get: () => this._createPromise,
    },
    $mountPromise: {
      enumerable: true,
      get: () => this._mountPromise,
    },
    $unmountPromise: {
      enumerable: true,
      get: () => this._unmountPromise,
    },
    $destroyPromise: {
      enumerable: true,
      get: () => this._destroyPromise,
    },
  })
}

function defineDebouncedHelpers () {
  const t = 1000 / 10
  // bind debounced functions at runtime
  // for each instance to avoid interfering between
  // different instances
  this.scheduleRefresh = debounce(::this.refresh, t)
  this.scheduleRemount = debounce(::this.remount, t)
  this.scheduleRecreate = debounce(::this.recreate, t)
}
