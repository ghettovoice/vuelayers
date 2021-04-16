import debounce from 'debounce-promise'
import { Object as OlObject, Observable } from 'ol'
import EventType from 'ol/events/EventType'
import ObjectEventType from 'ol/ObjectEventType'
import { interval, merge as mergeObs, of as obsOf, race as raceObs, throwError as throwErrorObs } from 'rxjs'
import {
  delayWhen,
  filter as filterObs,
  first as firstObs,
  map as mapObs,
  mergeMap,
  publishReplay,
  refCount,
} from 'rxjs/operators'
import { v4 as uuid } from 'uuid'
import VueQuery from 'vuequery'
import { fromOlChangeEvent as obsFromOlChangeEvent, fromOlEvent as obsFromOlEvent, fromVueEvent } from '../rx-ext'
import {
  addPrefix,
  assert,
  coalesce,
  identity,
  isArray,
  isEqual,
  isFunction,
  kebabCase,
  makeWatchers,
  newLogger,
} from '../utils'
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
  UNMOUNTING: 'unmounting',
  UNMOUNTED: 'unmounted',
  DESTROYING: 'destroying',
  DESTROYED: 'destroyed',
}

export const OlObjectEvent = {
  CREATED: OlObjectState.CREATED,
  MOUNTED: OlObjectState.MOUNTED,
  UNMOUNTED: OlObjectState.UNMOUNTED,
  DESTROYED: OlObjectState.DESTROYED,
  ERROR: 'error',
}

export const OlObjectAction = {
  CREATE: 'create',
  MOUNT: 'mount',
  UNMOUNT: 'unmount',
  DESTROY: 'destroy',
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
      currentId: this.id,
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
    rev () {
      if (!this.$olObject) return

      if (this.currentId !== this.getIdInternal()) {
        this.currentId = this.getIdInternal()
      }
    },
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'id',
      'currentId',
      'olObjIdent',
    ]),
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
    /**
     * @type {Observable}
     * @private
     */
    this._olObjectEvents = this::newOlObjectEventsObs()

    this::defineDebounceMethods()
    this::defineServices()

    await this::execInit(false)
  },
  async mounted () {
    await this::execMount()
  },
  async beforeDestroy () {
    await this::execUnmount(true)
  },
  async destroyed () {
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

      await this.changed()
      this.subscribeAll()
    },
    /**
     * @return {module:ol/Object~BaseObject|Promise<module:ol/Object~BaseObject>}
     * @protected
     * @abstract
     */
    createOlObject () {
      throw new Error(`${this.vmName} not implemented method: createOlObject()`)
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
    mount () {},
    /**
     * @return {void|Promise<void>}
     * @protected
     */
    unmount () {},
    /**
     * Refresh internal ol objects
     * @return {Promise<void>}
     */
    async refresh () {
      let olObj
      try {
        olObj = await this.resolveOlObject()
        if (olObj instanceof Observable) {
          return new Promise(resolve => {
            olObj.once('change', () => resolve())
            olObj.changed()
          })
        }
      } catch (err) {
        // todo check why this catch not catching OLObjectNotInitializedError from resolveOlObject
      }

      return this.changed()
    },
    /**
     * @return {Promise<void>}
     */
    async scheduleRefresh () {
      try {
        await this.debounceRefresh()
      } catch (err) {}
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
        OlObjectState.UNMOUNTING,
        OlObjectState.UNMOUNTED,
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
        OlObjectState.UNMOUNTING,
        OlObjectState.UNMOUNTED,
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
     * @protected
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

      return this.$olObject || throw new OLObjectNotInitializedError(`${this.vmName} OpenLayers object is undefined`)
    },
    /**
     * @return {Promise}
     */
    async $nextTickPromise () {
      return new Promise(::this.$nextTick)
    },
    /**
     * @return {string|number}
     */
    getId () {
      return coalesce(this.$olObject && this.getIdInternal(), this.currentId)
    },
    /**
     * @return {*}
     * @protected
     */
    getIdInternal () {
      if (this.$olObject instanceof OlObject) {
        return this.$olObject.get('id')
      }

      return this.$olObject.id
    },
    /**
     * @param {string|number} id
     */
    setId (id) {
      assert(id != null && id !== '', 'Invalid id')

      if (this.currentId !== id) {
        this.currentId = id
      }
      this.$olObject && this.setIdInternal(id)
    },
    /**
     * @param {*} id
     * @protected
     */
    setIdInternal (id) {
      if (this.$olObject instanceof OlObject) {
        if (this.$olObject.get('id') !== id) {
          this.$olObject.set('id', id)
        }

        return
      }

      if (this.$olObject.id !== id) {
        this.$olObject.id = id
      }
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async changed () {
      this.rev++
      await this.$nextTickPromise()
    },
    /**
     * @param {string|number} value
     * @protected
     */
    idChanged (value) {
      this.setId(value)
    },
    /**
     * @param {string|number} value
     * @protected
     */
    currentIdChanged (value) {
      if (value === this.id) return

      this.$emit('update:id', value)
    },
    /**
     * @param {string|undefined} value
     * @param {string|undefined} prevValue
     * @protected
     */
    olObjIdentChanged (value, prevValue) {
      if (value && prevValue) {
        this.moveInstance(value, prevValue)
      } else if (value && !prevValue && this.$olObject) {
        this.setInstance(value, this.$olObject)
      } else if (!value && prevValue) {
        this.unsetInstance(prevValue)
      }
    },
    /**
     * @protected
     */
    syncNonObservable () {
      this.setId(this.getId())
    },
  },
}

function defineDebounceMethods () {
  this.debounceRefresh = debounce(::this.refresh, FRAME_TIME)
  this.debounceRemount = debounce(::this.remount, FRAME_TIME)
  this.debounceRecreate = debounce(::this.recreate, FRAME_TIME)
  this.debounceChanged = debounce(::this.changed, FRAME_TIME)
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
    $olObjectEvents: {
      enumerable: true,
      get: () => this._olObjectEvents,
    },
    /**
     * @type {Promise<void>}
     */
    $createPromise: {
      enumerable: true,
      get: () => this::newLifecyclePromise(
        OlObjectAction.CREATE,
        OlObjectEvent.CREATED,
        {
          [OlObjectState.CREATING]: [OlObjectAction.CREATE, OlObjectEvent.CREATED],
        },
      ),
    },
    /**
     * @type {Promise<void>}
     */
    $mountPromise: {
      enumerable: true,
      get: () => this.$createPromise.then(() => this::newLifecyclePromise(
        OlObjectAction.MOUNT,
        OlObjectEvent.MOUNTED,
        {
          [OlObjectState.CREATING]: [OlObjectAction.CREATE, OlObjectEvent.CREATED],
          [OlObjectState.MOUNTING]: [OlObjectAction.MOUNT, OlObjectEvent.MOUNTED],
        },
      )),
    },
    /**
     * @type {Promise<void>}
     */
    $unmountPromise: {
      enumerable: true,
      get: () => this.$mountPromise.then(() => this::newLifecyclePromise(
        OlObjectAction.UNMOUNT,
        OlObjectEvent.UNMOUNTED,
        {
          [OlObjectState.CREATING]: [OlObjectAction.CREATE, OlObjectEvent.CREATED],
          [OlObjectState.MOUNTING]: [OlObjectAction.MOUNT, OlObjectEvent.MOUNTED],
          [OlObjectState.UNMOUNTING]: [OlObjectAction.UNMOUNT, OlObjectEvent.UNMOUNTED],
        },
      )),
    },
    /**
     * @type {Promise<void>}
     */
    $destroyPromise: {
      enumerable: true,
      get: () => this.$unmountPromise.then(() => this::newLifecyclePromise(
        OlObjectAction.DESTROY,
        OlObjectEvent.DESTROYED,
        {
          [OlObjectState.CREATING]: [OlObjectAction.CREATE, OlObjectEvent.CREATED],
          [OlObjectState.MOUNTING]: [OlObjectAction.MOUNT, OlObjectEvent.MOUNTED],
          [OlObjectState.UNMOUNTING]: [OlObjectAction.UNMOUNT, OlObjectEvent.UNMOUNTED],
          [OlObjectState.DESTROYING]: [OlObjectAction.DESTROY, OlObjectEvent.DESTROYED],
        },
      )),
    },
  })
}

function newOlObjectEventsObs () {
  return mergeObs(
    ...Object.values(OlObjectEvent)
      .map(name => fromVueEvent(this.$eventBus, name, args => ({ name, args: isArray(args) ? args : [args] }))
        .pipe(
          filterObs(({ args }) => args[0] === this || args[1] === this),
        )),
  ).pipe(
    publishReplay(),
    refCount(),
  )
}

function newLifecyclePromise (action, endEvent, startStates) {
  const newFinishObs = (action, endEvent) => raceObs(
    this.$olObjectEvents.pipe(filterObs(({ name }) => name === endEvent)),
    this.$olObjectEvents.pipe(filterObs(({ name, args }) => {
      return name === OlObjectEvent.ERROR &&
        args[0] instanceof LifecycleError &&
        args[0].action === action
    })),
  )

  return mergeObs(
    newFinishObs(action, endEvent),
    this.$olObjectEvents.pipe(
      filterObs(({ name, args }) => {
        return name === OlObjectEvent.ERROR &&
          args[0] instanceof CanceledError
      }),
    ),
  ).pipe(
    firstObs(),
    mergeMap(evt => {
      let obs = obsOf(evt)
      // If at the time of CancelError the ol object stay in some intermediate state
      // we need to delay observable emit until current hook complete
      if (
        evt.name === OlObjectEvent.ERROR &&
        evt.args[0] instanceof CanceledError &&
        startStates[this.$olObjectState] != null
      ) {
        obs = obs.pipe(delayWhen(() => newFinishObs(...startStates[this.$olObjectState])))
      }
      return obs
    }),
    mergeMap(evt => {
      if (evt.name === OlObjectEvent.ERROR) {
        return throwErrorObs(evt.args[0])
      }
      return obsOf(evt)
    }),
    mapObs(({ args }) => args.length === 1 ? args[0] : args),
  ).toPromise()
}

/**
 * @param {boolean} [resetEventsObs=true]
 * @returns {Promise<void>}
 * @private
 */
async function execInit (resetEventsObs = true) {
  const prevState = this._olObjectState

  if (resetEventsObs) {
    this._olObjectEvents = this::newOlObjectEventsObs()
  }
  this._olObjectEvents.subscribe()

  try {
    const canceled = await Promise.race([
      Promise.resolve(this.beforeInit()).then(() => false),
      this.$olObjectEvents.pipe(
        filterObs(({ name, args }) => {
          return name === OlObjectEvent.ERROR &&
            args[0] instanceof CanceledError
        }),
        firstObs(),
      ).toPromise()
        .then(() => true),
    ])
    if (canceled) {
      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log(`ol object ${OlObjectAction.CREATE} canceled`)
      }
      return
    }

    this._olObjectState = OlObjectState.CREATING

    await this.init()

    this._olObjectState = OlObjectState.CREATED

    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.log(`ol object ${OlObjectEvent.CREATED}`)
    }

    this.$emit(OlObjectEvent.CREATED, this)
    this.$eventBus.$emit(OlObjectEvent.CREATED, this)
  } catch (err) {
    const lcErr = new LifecycleError(err, this.vmName, OlObjectAction.CREATE)
    this._olObjectState = prevState

    this.$emit(OlObjectEvent.ERROR, lcErr, this)
    this.$eventBus.$emit(OlObjectEvent.ERROR, lcErr, this)

    throw lcErr
  }
}

/**
 * @return {Promise<void>}
 * @private
 */
async function execMount () {
  const prevState = this._olObjectState

  try {
    await this.$createPromise

    const canceled = await Promise.race([
      Promise.resolve(this.beforeMount()).then(() => false),
      this.$olObjectEvents.pipe(
        filterObs(({ name, args }) => {
          return name === OlObjectEvent.ERROR &&
            args[0] instanceof CanceledError
        }),
        firstObs(),
      ).toPromise()
        .then(() => true),
    ])
    if (canceled) {
      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log(`ol object ${OlObjectAction.MOUNT} canceled`)
      }
      return
    }

    this._olObjectState = OlObjectState.MOUNTING

    await this.mount()

    this._olObjectState = OlObjectState.MOUNTED

    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.log(`ol object ${OlObjectEvent.MOUNTED}`)
    }

    this.$emit(OlObjectEvent.MOUNTED, this)
    this.$eventBus.$emit(OlObjectEvent.MOUNTED, this)
  } catch (err) {
    if (err instanceof CanceledError) {
      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log(`ol object ${OlObjectAction.MOUNT} canceled`)
      }

      return
    }

    const lcErr = new LifecycleError(err, this.vmName, OlObjectAction.MOUNT)
    this._olObjectState = prevState

    this.$emit(OlObjectEvent.ERROR, lcErr, this)
    this.$eventBus.$emit(OlObjectEvent.ERROR, lcErr, this)

    throw lcErr
  }
}

/**
 * @param {boolean} [fireCancel=false]
 * @return {void|Promise<void>}
 * @private
 */
async function execUnmount (fireCancel = false) {
  const prevState = this._olObjectState

  if (fireCancel) {
    if ([
      OlObjectState.UNDEF,
      OlObjectState.CREATING,
      OlObjectState.CREATED,
      OlObjectState.MOUNTING,
    ].includes(this.$olObjectState)) {
      const err = new CanceledError(`${this.vmName} ol object lifecycle canceled`)
      this.$emit(OlObjectEvent.ERROR, err, this)
      this.$eventBus.$emit(OlObjectEvent.ERROR, err, this)
    }
  }

  try {
    try {
      await this.$mountPromise
    } catch (err) {
      if (err instanceof CanceledError) {
        if (this.$olObjectState !== OlObjectState.MOUNTED) {
          if (process.env.VUELAYERS_DEBUG) {
            this.$logger.log(`ol object ${OlObjectAction.UNMOUNT} canceled`)
          }

          return
        }
      } else {
        throw err
      }
    }

    this._olObjectState = OlObjectState.UNMOUNTING

    await this.unmount()

    this._olObjectState = OlObjectState.UNMOUNTED

    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.log(`ol object ${OlObjectEvent.UNMOUNTED}`)
    }

    this.$emit(OlObjectEvent.UNMOUNTED, this)
    this.$eventBus.$emit(OlObjectEvent.UNMOUNTED, this)
  } catch (err) {
    const lcErr = new LifecycleError(err, this.vmName, OlObjectAction.UNMOUNT)
    this._olObjectState = prevState

    this.$emit(OlObjectEvent.ERROR, this, lcErr)
    this.$eventBus.$emit(OlObjectEvent.ERROR, this, lcErr)

    throw lcErr
  }
}

/**
 * @returns {Promise<void>}
 * @private
 */
async function execDeinit () {
  const prevState = this._olObjectState

  try {
    try {
      await this.$unmountPromise
    } catch (err) {
      if (err instanceof CanceledError) {
        if (this.$olObjectState !== OlObjectState.CREATED) {
          if (process.env.VUELAYERS_DEBUG) {
            this.$logger.log(`ol object ${OlObjectAction.DESTROY} canceled`)
          }

          return
        }
      } else {
        throw err
      }
    }

    this._olObjectState = OlObjectState.DESTROYING

    await this.deinit()

    this._olObjectState = OlObjectState.DESTROYED

    if (process.env.VUELAYERS_DEBUG) {
      this.$logger.log(`ol object ${OlObjectEvent.DESTROYED}`)
    }

    this.$emit(OlObjectEvent.DESTROYED, this)
    this.$eventBus.$emit(OlObjectEvent.DESTROYED, this)
  } catch (err) {
    const lcErr = new LifecycleError(err, this.vmName, OlObjectAction.DESTROY)
    this._olObjectState = prevState

    this.$emit(OlObjectEvent.ERROR, this, lcErr)
    this.$eventBus.$emit(OlObjectEvent.ERROR, this, lcErr)

    throw lcErr
  }
}

function subscribeToOlObjectEvents () {
  if (this.$olObject instanceof Observable) {
    const setterKey = addPrefix('set')
    const propChanges = obsFromOlChangeEvent(this.$olObject, [
      'id',
    ], true, evt => ({
      ...evt,
      setter: this[setterKey(evt.prop)],
    }))
    this.subscribeTo(propChanges, ({ setter, value }) => setter(value))

    this.subscribeTo(
      mergeObs(
        obsFromOlEvent(this.$olObject, EventType.CHANGE),
        obsFromOlEvent(this.$olObject, ObjectEventType.PROPERTYCHANGE),
      ),
      ::this.debounceChanged,
    )

    this.subscribeTo(obsFromOlEvent(this.$olObject, EventType.ERROR), evt => this.$emit(OlObjectEvent.ERROR, evt))
  } else {
    this.subscribeTo(interval(FRAME_TIME), ::this.syncNonObservable)
  }
}

export class LifecycleError extends Error {
  name = 'LifecycleError'

  constructor (err, vmName, action) {
    if (err instanceof LifecycleError) {
      err = err.err
    }
    const baseMessage = `${vmName} ${action} ol object failed`
    const message = `${baseMessage}: ${err.message}`
    super(message)
    this.vmName = vmName
    this.action = action
    this.err = err
    if (err.stack) {
      this.stack = `${baseMessage}: ${err.stack}`
    } else {
      if (isFunction(Error.captureStackTrace)) {
        Error.captureStackTrace(this, this.constructor)
      } else {
        this.stack = (new Error(message)).stack
      }
    }
  }
}

export class CanceledError extends Error {
  name = 'CanceledError'

  constructor (message) {
    super(message)
    if (isFunction(Error.captureStackTrace)) {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (new Error(message)).stack
    }
  }
}

export function isCreateError (err) {
  return err instanceof LifecycleError &&
    err.action === OlObjectAction.CREATE
}

export function isMountError (err) {
  return err instanceof LifecycleError &&
    err.action === OlObjectAction.MOUNT
}

export function isUnmountError (err) {
  return err instanceof LifecycleError &&
    err.action === OlObjectAction.UNMOUNT
}

export function isDestroyError (err) {
  return err instanceof LifecycleError &&
    err.action === OlObjectAction.DESTROY
}

export class OLObjectNotInitializedError extends Error {
  name = 'OLObjectNotInitializedError'

  constructor (message) {
    super(message)
    if (isFunction(Error.captureStackTrace)) {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (new Error(message)).stack
    }
  }
}

export function makeChangeOrRecreateWatchers (props, deepProps = []) {
  return makeWatchers(props, prop => ({
    deep: deepProps.includes(prop),
    handler (...args) {
      const handler = this[`${prop}Changed`]
      if (isFunction(handler)) {
        return handler(...args)
      }

      if (isEqual(args[0], args[1])) return

      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log(`${prop} changed, scheduling recreate... %O ===> %O`, args[1], args[0])
      }

      return this.scheduleRecreate()
    },
  }))
}
