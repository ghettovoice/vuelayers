import debounce from 'debounce-promise'
import { Observable } from 'ol'
import EventType from 'ol/events/EventType'
import { concat as concatObs, from as fromObs, race as raceObs, throwError as throwErrorObs } from 'rxjs'
import { first as firstObs, mergeMap } from 'rxjs/operators'
import { v4 as uuid } from 'uuid'
import VueQuery from 'vuequery'
import { bufferDebounceTime, fromOlEvent as obsFromOlEvent, fromVueEvent as obsFromVueEvent } from '../rx-ext'
import { assert, identity, isFunction, kebabCase, newLogger } from '../utils'
import eventBus from './event-bus'
import identMap from './ident-map'
import rxSubs from './rx-subs'
import services from './services'

export const VM_PROP = 'vm'
export const FRAME_TIME = 1000 / 60

export const OlObjectState = {
  UNDEF: 'undef',
  CREATING: 'creating',
  CREATED: 'created',
  MOUNTING: 'mounting',
  MOUNTED: 'mounted',
}

export const OlObjectEvent = {
  CREATED: 'created',
  CREATE_ERROR: 'createerror',
  MOUNTED: 'mounted',
  MOUNT_ERROR: 'mounterror',
  UNMOUNTED: 'unmounted',
  UNMOUNT_ERROR: 'unmounterror',
  DESTROYED: 'destroyed',
  DESTROY_ERROR: 'destroyerror',
}

/**
 * Basic ol component mixin.
 * todo try to subscribe to generic change event here and update rev according to internal ol counter
 */
export default {
  mixins: [
    identMap,
    rxSubs,
    services,
    eventBus,
  ],
  props: {
    /**
     * @type {string|number}
     */
    id: {
      type: [String, Number],
      default: uuid,
      validator: value => value != null && value !== '',
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
    currentId () {
      if (this.rev && this.$olObject) {
        return this.getIdInternal()
      }

      return this.id
    },
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
      return [this.vmClass, this.currentId].filter(identity).join('.')
    },
    /**
     * @type {string}
     */
    vmName () {
      return [this.$options.name, this.currentId].filter(identity).join('.')
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
    async id (value) {
      await this.setId(value)
    },
    currentId: /*#__PURE__*/debounce(function (value) {
      if (value === this.id) return

      this.$emit('update:id', value)
    }, FRAME_TIME),
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
    this._olObjectState = OlObjectState.UNDEF
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
    beforeInit () {},
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

      this.subscribeAll()
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
     * @return {Promise<void>}
     * @protected
     */
    async deinit () {
      this.unsubscribeAll()
      this.unsetInstances()

      if (this._olObject) {
        this._olObject[VM_PROP] = this._olObject[VM_PROP].filter(vm => vm !== this)
        this._olObject = undefined
      }
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    beforeMount () {},
    /**
     * @return {Promise<void>}
     * @protected
     */
    async mount () {},
    /**
     * @return {void|Promise<void>}
     * @protected
     */
    async unmount () {},
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
      if (this.$olObjectState === OlObjectState.MOUNTED) {
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
        OlObjectState.MOUNTING,
        OlObjectState.MOUNTED,
      ].includes(this.$olObjectState)) {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('remount scheduled')
        }

        await this.debounceRemount()
      } else {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('remount discarded')
        }
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
        OlObjectState.CREATED,
        OlObjectState.MOUNTING,
        OlObjectState.MOUNTED,
      ].includes(this.$olObjectState)) {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('recreating...')
        }

        const mounted = [
          OlObjectState.MOUNTING,
          OlObjectState.MOUNTED,
        ].includes(this.$olObjectState)
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
        OlObjectState.CREATING,
        OlObjectState.CREATED,
        OlObjectState.MOUNTING,
        OlObjectState.MOUNTED,
      ].includes(this.$olObjectState)) {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('recreate scheduled')
        }

        await this.debounceRecreate()
      } else {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('recreate discarded')
        }
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
     * @return {void}
     */
    subscribeAll () {
      this::subscribeToOlObjectEvents()
    },
    /**
     * @returns {Promise<Object>}
     * @throws {Error} If underlying OpenLayers object not initialized (incorrect initialization, already destroy).
     */
    async resolveOlObject () {
      await this.$createPromise

      return this.$olObject || throw new Error('OpenLayers object is undefined')
    },
    async $nextTickPromise () {
      return new Promise(::this.$nextTick)
    },
    /**
     * @return {Promise<string|number>}
     */
    async getId () {
      await this.resolveOlObject()

      return this.getIdInternal()
    },
    /**
     * @return {string|number}
     * @protected
     */
    getIdInternal () {
      if (isFunction(this.$olObject.get)) {
        return this.$olObject.get('id')
      }

      return this.$olObject.id
    },
    /**
     * @param {string|number} id
     * @return {Promise<void>}
     */
    async setId (id) {
      await this.resolveOlObject()

      this.setIdInternal(id)
    },
    /**
     * @param {string|number} id
     * @protected
     */
    setIdInternal (id) {
      assert(id != null && id !== '', 'Invalid id')

      if (id === this.getIdInternal()) return

      if (isFunction(this.$olObject.set)) {
        this.$olObject.set('id', id)

        return
      }

      this.$olObject.id = id
      ++this.rev
    },
  },
}

function defineDebounceMethods () {
  this.debounceRefresh = debounce(function () {
    return this.refresh()
  }, FRAME_TIME)

  this.debounceRemount = debounce(function () {
    return this.remount()
  }, FRAME_TIME)

  this.debounceRecreate = debounce(function () {
    return this.recreate()
  }, FRAME_TIME)
}

function defineServices () {
  Object.defineProperties(this, {
    $vq: {
      enumerable: true,
      get: () => VueQuery(this),
    },
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
          OlObjectState.CREATED,
          OlObjectState.MOUNTING,
          OlObjectState.MOUNTED,
        ].includes(this._olObjectState)) {
          return Promise.resolve()
        }

        return raceObs(
          obsFromVueEvent(this, [OlObjectEvent.CREATED]),
          obsFromVueEvent(this, [OlObjectEvent.CREATE_ERROR]).pipe(
            mergeMap(([_, err]) => throwErrorObs(err)),
          ),
        ).pipe(firstObs())
          .toPromise()
      },
    },
    /**
     * @type {Promise<void>}
     */
    $mountPromise: {
      enumerable: true,
      get: () => {
        if ([OlObjectState.MOUNTED].includes(this._olObjectState)) {
          return Promise.resolve()
        }

        return raceObs(
          obsFromVueEvent(this, [OlObjectEvent.MOUNTED]),
          obsFromVueEvent(this, [
            OlObjectEvent.CREATE_ERROR,
            OlObjectEvent.MOUNT_ERROR,
          ]).pipe(
            mergeMap(([_, err]) => throwErrorObs(err)),
          ),
        ).pipe(firstObs())
          .toPromise()
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
          raceObs(
            obsFromVueEvent(this, [OlObjectEvent.UNMOUNTED]),
            obsFromVueEvent(this, [
              OlObjectEvent.CREATE_ERROR,
              OlObjectEvent.MOUNT_ERROR,
              OlObjectEvent.UNMOUNT_ERROR,
            ]).pipe(
              mergeMap(([_, err]) => throwErrorObs(err)),
            ),
          ).pipe(firstObs()),
        ).toPromise()
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
          raceObs(
            obsFromVueEvent(this, [OlObjectEvent.DESTROYED]),
            obsFromVueEvent(this, [
              OlObjectEvent.CREATE_ERROR,
              OlObjectEvent.MOUNT_ERROR,
              OlObjectEvent.UNMOUNT_ERROR,
              OlObjectEvent.DESTROY_ERROR,
            ]).pipe(
              mergeMap(([_, err]) => throwErrorObs(err)),
            ),
          ).pipe(firstObs()),
        ).toPromise()
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
    await this.beforeInit()

    this._olObjectState = OlObjectState.CREATING

    await this.init()

    this._olObjectState = OlObjectState.CREATED

    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.log(`ol object ${OlObjectEvent.CREATED}`)
    }

    this.$emit(OlObjectEvent.CREATED, this)
    this.$eventBus.$emit(OlObjectEvent.CREATED, this)
  } catch (err) {
    this._olObjectState = OlObjectState.UNDEF

    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.error(`ol object ${OlObjectEvent.CREATE_ERROR}`, err)
    }

    this.$emit(OlObjectEvent.CREATE_ERROR, this, err)
    this.$eventBus.$emit(OlObjectEvent.CREATE_ERROR, this, err)

    throw err
  }
}

/**
 * @returns {Promise<void>}
 * @private
 */
async function execDeinit () {
  try {
    this._olObjectState = OlObjectState.UNDEF

    await this.deinit()

    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.log(`ol object ${OlObjectEvent.DESTROYED}`)
    }

    this.$emit(OlObjectEvent.DESTROYED, this)
    this.$eventBus.$emit(OlObjectEvent.DESTROYED, this)
  } catch (err) {
    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.error(`ol object ${OlObjectEvent.DESTROY_ERROR}`, err)
    }

    this.$emit(OlObjectEvent.DESTROY_ERROR, this, err)
    this.$eventBus.$emit(OlObjectEvent.DESTROY_ERROR, this, err)

    throw err
  }
}

/**
 * @return {Promise<void>}
 * @private
 */
async function execMount () {
  try {
    await this.beforeMount()

    this._olObjectState = OlObjectState.MOUNTING

    await this.mount()

    this._olObjectState = OlObjectState.MOUNTED

    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.log(`ol object ${OlObjectEvent.MOUNTED}`)
    }

    this.$emit(OlObjectEvent.MOUNTED, this)
    this.$eventBus.$emit(OlObjectEvent.MOUNTED, this)
  } catch (err) {
    this._olObjectState = OlObjectState.CREATED

    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.error(`ol object ${OlObjectEvent.MOUNT_ERROR}`, err)
    }

    this.$emit(OlObjectEvent.MOUNT_ERROR, this, err)
    this.$eventBus.$emit(OlObjectEvent.MOUNT_ERROR, this, err)

    throw err
  }
}

/**
 * @return {void|Promise<void>}
 * @private
 */
async function execUnmount () {
  try {
    this._olObjectState = OlObjectState.CREATED

    await this.unmount()

    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.log(`ol object ${OlObjectEvent.UNMOUNTED}`)
    }

    this.$emit(OlObjectEvent.UNMOUNTED, this)
    this.$eventBus.$emit(OlObjectEvent.UNMOUNTED, this)
  } catch (err) {
    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.error(`ol object ${OlObjectEvent.UNMOUNT_ERROR}`, err)
    }

    this.$emit(OlObjectEvent.UNMOUNT_ERROR, this, err)
    this.$eventBus.$emit(OlObjectEvent.UNMOUNT_ERROR, this, err)

    throw err
  }
}

function subscribeToOlObjectEvents () {
  if (!(this.$olObject instanceof Observable)) return

  const changes = obsFromOlEvent(this.$olObject, EventType.CHANGE).pipe(
    bufferDebounceTime(FRAME_TIME),
  )
  this.subscribeTo(changes, () => {
    ++this.rev
  })
}
