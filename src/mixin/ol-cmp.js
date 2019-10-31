import debounce from 'debounce-promise'
import { interval as intervalObs } from 'rxjs/observable'
import { first as firstObs, skipWhile } from 'rxjs/operators'
import uuid from 'uuid/v4'
import { log } from '../util/log'
import { identity, isFunction } from '../util/minilo'
import identMap from './ident-map'
import rxSubs from './rx-subs'
import services from './services'

const VM_PROP = 'vm'

/**
 * Basic ol component mixin.
 * todo try to subscribe to generic change event here and update rev according to internal ol counter
 */
export default {
  VM_PROP,
  mixins: [identMap, rxSubs, services],
  props: {
    id: {
      type: [String, Number],
      default: () => uuid(),
    },
  },
  data () {
    return {
      rev: 0,
    }
  },
  computed: {
    cmpName () {
      return this.$options.name
    },
    vmId () {
      return [this.cmpName, this.id].filter(identity).join('-')
    },
    vmName () {
      return [this.cmpName, this.id].filter(identity).join(' ')
    },
    olObjIdent () {
      return this.selfIdent
    },
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
      this._olObject = await this.instanceFactoryCall(this.olObjIdent, ::this.createOlObject)
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
      this.unsetInstances()

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
      this.subscribeAll()
    },
    /**
     * @return {void|Promise<void>}
     * @protected
     */
    unmount () {
      this.unsubscribeAll()
    },
    /**
     * Refresh internal ol objects
     * @return {Promise<void>}
     */
    refresh () {
      if (this.$olObject == null) return Promise.resolve()

      return new Promise(resolve => {
        if (this.$olObject && isFunction(this.$olObject.changed)) {
          this.$olObject.once('change', () => resolve())
          this.$olObject.changed()
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
      if (this.$olObject == null) return

      await this.unmount()
      await this.mount()
    },
    /**
     * Only for internal purpose to support watching for properties
     * for which OpenLayers doesn't provide setters.
     * @return {Promise}
     * @protected
     */
    async recreate () {
      if (this.$olObject == null) return

      await this.unmount()
      await this.deinit()
      await this.init()
      await this.mount()
    },
    subscribeAll () {},
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
  this._createPromise = Promise.resolve(this.beforeInit())
    .then(() => this.init())
    .then(makeEventEmitter('created'))

  // mount
  const mountObs = intervalObs(1000 / 60)
    .pipe(
      skipWhile(() => this._mounted !== true),
      firstObs(),
    )
  this._mountPromise = mountObs.toPromise(Promise)
    .then(() => this.mount())
    .then(makeEventEmitter('mounted'))

  // unmount
  const unmountObs = intervalObs(1000 / 60)
    .pipe(
      skipWhile(() => this._mounted !== false),
      firstObs(),
    )
  this._unmountPromise = unmountObs.toPromise(Promise)
    .then(() => this.unmount())
    .then(makeEventEmitter('unmounted'))

  // destroy
  const destroyObs = intervalObs(1000 / 60)
    .pipe(
      skipWhile(() => this._destroyed !== true),
      firstObs(),
    )
  this._destroyPromise = destroyObs.toPromise(Promise)
    .then(() => this.deinit())
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
  this.scheduleRefresh = debounce(function () {
    return this.refresh()
  }, t)
  this.scheduleRemount = debounce(function () {
    return this.remount()
  }, t)
  this.scheduleRecreate = debounce(function () {
    return this.recreate()
  }, t)
}
