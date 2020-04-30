import debounce from 'debounce-promise'
import { concat as concatObs, from as fromObs } from 'rxjs'
import { first as firstObs } from 'rxjs/operators'
import { v4 as uuid } from 'uuid'
import { obsFromVueEvent } from '../rx-ext'
import { newLogger } from '../util/log'
import { identity, isFunction, kebabCase } from '../util/minilo'
import identMap from './ident-map'
import rxSubs from './rx-subs'
import services from './services'

const VM_PROP = 'vm'

const STATE_UNDEF = 'undef'
const STATE_CREATING = 'creating'
const STATE_CREATED = 'created'
const STATE_MOUNTING = 'mounting'
const STATE_MOUNTED = 'mounted'

const EVENT_CREATED = 'created'
const EVENT_CREATE_ERROR = 'createerror'
const EVENT_MOUNTED = 'mounted'
const EVENT_MOUNT_ERROR = 'mounterror'
const EVENT_UNMOUNTED = 'unmounted'
const EVENT_UNMOUNT_ERROR = 'unmounterror'
const EVENT_DESTROYED = 'destroyed'
const EVENT_DESTROY_ERROR = 'destroyerror'

/**
 * Basic ol component mixin.
 * todo try to subscribe to generic change event here and update rev according to internal ol counter
 */
export default {
  VM_PROP,
  mixins: [
    identMap,
    rxSubs,
    services,
  ],
  props: {
    /**
     * @type {string|number}
     */
    id: {
      type: [String, Number],
      default: uuid,
    },
    /**
     * Unique key for saving to identity map
     * @type {string|number|undefined}
     */
    ident: [String, Number],
  },
  data () {
    return {
      rev: 0,
    }
  },
  computed: {
    /**
     * @type {string}
     */
    vmClass () {
      return kebabCase(this.$options.name)
    },
    /**
     * @type {string}
     */
    vmId () {
      return [this.vmClass, this.id].filter(identity).join('.')
    },
    /**
     * @type {string}
     */
    vmName () {
      return [this.$options.name, this.id].filter(identity).join('.')
    },
    /**
     * @type {string|undefined}
     */
    olObjIdent () {
      if (!this.ident) return

      return this.makeIdent(this.ident)
    },
  },
  watch: {
    olObjIdent (value, prevValue) {
      if (value && prevValue) {
        this.moveInstance(value, prevValue)
      } else if (value && !prevValue && this.$olObject) {
        this.setInstance(value, this.$olObject)
      } else if (!value && prevValue) {
        this.unsetInstance(prevValue)
      }
    },
  },
  async created () {
    /**
     * @type {{warn: (function(...[*]): void), log: (function(...[*]): void), error: (function(...[*]): void)}}
     * @private
     */
    this._logger = newLogger(this.vmName)
    /**
     * @type {number}
     * @private
     */
    this._olObjectState = STATE_UNDEF
    /**
     * @type {module:ol/Object~BaseObject}
     * @private
     */
    this._olObject = undefined

    this::defineDebounceMethods()
    this::defineServices()

    await this::execInit()
  },
  async mounted () {
    await this.$createPromise
    await this::execMount()
  },
  async beforeDestroy () {
    await this.$mountPromise
    await this::execUnmount()
  },
  async destroyed () {
    await this.$unmountPromise
    await this::execDeinit()
  },
  methods: {
    /**
     * @return {Promise<void>} Resolves when initialization completes
     * @protected
     */
    async init () {
      this._olObject = await this.instanceFactoryCall(this.olObjIdent, ::this.createOlObject)
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
      throw new Error('Not implemented method: createOlObject')
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
     * @return {Promise<void>}
     * @protected
     */
    async mount () {
      await this.subscribeAll()
    },
    /**
     * @return {void|Promise<void>}
     * @protected
     */
    async unmount () {
      await this.unsubscribeAll()
    },
    /**
     * Refresh internal ol objects
     * @return {Promise<void>}
     */
    async refresh () {
      const olObj = await this.resolveOlObject()

      return new Promise(resolve => {
        if (isFunction(olObj.changed)) {
          olObj.once('change', () => {
            ++this.rev
            resolve()
          })
          olObj.changed()
        } else {
          ++this.rev
          resolve()
        }
      })
    },
    /**
     * @return {Promise<void>}
     */
    async scheduleRefresh () {
      await this.debounceRefresh()
    },
    /**
     * Internal usage only in components that doesn't support refreshing.
     * @return {Promise<void>}
     * @protected
     */
    async remount () {
      if (this.$olObjectState === STATE_MOUNTED) {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('remounting...')
        }

        await this::execUnmount()
        await this::execMount()
      } else {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('remount discarded')
        }
      }
    },
    /**
     * @return {Promise<void>}
     */
    async scheduleRemount () {
      if ([
        STATE_MOUNTING,
        STATE_MOUNTED,
      ].includes(this.$olObjectState)) {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('remount scheduled')
        }

        await this.debounceRemount()
      }
    },
    /**
     * Only for internal purpose to support watching for properties
     * for which OpenLayers doesn't provide setters.
     * @return {Promise}
     * @protected
     */
    async recreate () {
      if ([
        STATE_CREATED,
        STATE_MOUNTING,
        STATE_MOUNTED,
      ].includes(this.$olObjectState)) {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('recreating...')
        }

        const mounted = this.$olObjectState === STATE_MOUNTED
        if (mounted) {
          await this::execUnmount()
        }

        await this::execDeinit()
        await this::execInit()

        if (mounted) {
          await this::execMount()
        }
      } else {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('recreate discarded')
        }
      }
    },
    /**
     * @return {Promise<void>}
     */
    async scheduleRecreate () {
      if ([
        STATE_CREATING,
        STATE_CREATED,
        STATE_MOUNTING,
        STATE_MOUNTED,
      ].includes(this.$olObjectState)) {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('recreate scheduled')
        }

        await this.debounceRecreate()
      }
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
  },
}

function defineDebounceMethods () {
  const t = 1000 / 60

  this.debounceRefresh = debounce(function () {
    return this.refresh()
  }, t)

  this.debounceRemount = debounce(function () {
    return this.remount()
  }, t)

  this.debounceRecreate = debounce(function () {
    return this.recreate()
  }, t)
}

function defineServices () {
  Object.defineProperties(this, {
    /**
     * @type {{warn: (function(...[*]): void), log: (function(...[*]): void), error: (function(...[*]): void)}}
     */
    $logger: {
      enumerable: true,
      get: () => this._logger,
    },
    /**
     * @type {string}
     */
    $olObjectState: {
      enumerable: true,
      get: () => this._olObjectState,
    },
    /**
     * @type {module:ol/Object~BaseObject|undefined}
     */
    $olObject: {
      enumerable: true,
      get: () => this._olObject,
    },
    /**
     * @type {Promise<void>}
     */
    $createPromise: {
      enumerable: true,
      get: () => {
        if ([
          STATE_CREATED,
          STATE_MOUNTING,
          STATE_MOUNTED,
        ].includes(this._olObjectState)) {
          return Promise.resolve()
        }

        return obsFromVueEvent(this, [EVENT_CREATED, EVENT_CREATE_ERROR])
          .pipe(firstObs())
          .toPromise(Promise)
      },
    },
    /**
     * @type {Promise<void>}
     */
    $mountPromise: {
      enumerable: true,
      get: () => {
        if ([STATE_MOUNTED].includes(this._olObjectState)) {
          return Promise.resolve()
        }

        return obsFromVueEvent(this, [EVENT_MOUNTED, EVENT_MOUNT_ERROR])
          .pipe(firstObs())
          .toPromise(Promise)
      },
    },
    /**
     * @type {Promise<void>}
     */
    $unmountPromise: {
      enumerable: true,
      get: () => {
        return concatObs(
          fromObs(this.$mountPromise),
          obsFromVueEvent(this, [EVENT_UNMOUNTED, EVENT_UNMOUNT_ERROR])
            .pipe(firstObs()),
        ).toPromise(Promise)
      },
    },
    /**
     * @type {Promise<void>}
     */
    $destroyPromise: {
      enumerable: true,
      get: () => {
        return concatObs(
          fromObs(this.$unmountPromise),
          obsFromVueEvent(this, [EVENT_DESTROYED, EVENT_DESTROY_ERROR])
            .pipe(firstObs()),
        ).toPromise(Promise)
      },
    },
  })
}

/**
 * @returns {Promise<void>}
 * @private
 */
async function execInit () {
  try {
    this._olObjectState = STATE_CREATING

    await this.init()

    this._olObjectState = STATE_CREATED

    this.$emit(EVENT_CREATED, this)

    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.log(`ol object ${EVENT_CREATED}`)
    }
  } catch (err) {
    this._olObjectState = STATE_UNDEF

    this.$emit(EVENT_CREATE_ERROR, this)

    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.error(`ol object ${EVENT_CREATE_ERROR}`, err)
    }

    throw err
  }
}

/**
 * @returns {Promise<void>}
 * @private
 */
async function execDeinit () {
  try {
    this._olObjectState = STATE_UNDEF

    await this.deinit()

    this.$emit(EVENT_DESTROYED, this)

    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.log(`ol object ${EVENT_DESTROYED}`)
    }
  } catch (err) {
    this.$emit(EVENT_DESTROY_ERROR, this)

    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.error(`ol object ${EVENT_DESTROY_ERROR}`, err)
    }

    throw err
  }
}

/**
 * @return {Promise<void>}
 * @private
 */
async function execMount () {
  try {
    this._olObjectState = STATE_MOUNTING

    await this.mount()

    this._olObjectState = STATE_MOUNTED

    this.$emit(EVENT_MOUNTED, this)

    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.log(`ol object ${EVENT_MOUNTED}`)
    }
  } catch (err) {
    this._olObjectState = STATE_CREATED

    this.$emit(EVENT_MOUNT_ERROR, this)

    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.error(`ol object ${EVENT_MOUNT_ERROR}`, err)
    }

    throw err
  }
}

/**
 * @return {void|Promise<void>}
 * @protected
 */
async function execUnmount () {
  try {
    this._olObjectState = STATE_CREATED

    await this.unmount()

    this.$emit(EVENT_UNMOUNTED, this)

    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.log(`ol object ${EVENT_UNMOUNTED}`)
    }
  } catch (err) {
    this.$emit(EVENT_UNMOUNT_ERROR, this)

    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.error(`ol object ${EVENT_UNMOUNT_ERROR}`, err)
    }

    throw err
  }
}
