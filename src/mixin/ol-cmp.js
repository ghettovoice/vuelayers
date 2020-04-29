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

const STATE_UNDEF = 0
const STATE_CREATED = 1
const STATE_MOUNTED = 2

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
      return [this.vmClass, this.id].filter(identity).join('-')
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
          if ([STATE_CREATED, STATE_MOUNTED].includes(this._olObjectState)) {
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

    await this.init()
  },
  async mounted () {
    await this.$createPromise
    await this.mount()
  },
  async beforeDestroy () {
    await this.$mountPromise
    await this.unmount()
  },
  async destroyed () {
    await this.$unmountPromise
    await this.deinit()
  },
  methods: {
    /**
     * @return {Promise<void>} Resolves when initialization completes
     * @protected
     */
    async init () {
      try {
        this._olObject = await this.instanceFactoryCall(this.olObjIdent, ::this.createOlObject)
        this._olObject[VM_PROP] || (this._olObject[VM_PROP] = [])

        // for loaded from IdentityMap
        if (!this._olObject[VM_PROP].includes(this)) {
          this._olObject[VM_PROP].push(this)
        }

        ++this.rev

        this._olObjectState = STATE_CREATED

        this.$emit(EVENT_CREATED, this)

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`ol object ${EVENT_CREATED}`)
        }
      } catch (err) {
        this.$emit(EVENT_CREATE_ERROR, this)

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.error(`ol object ${EVENT_CREATE_ERROR}`, err)
        }

        throw err
      }
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
      try {
        this._olObjectState = STATE_UNDEF

        this.unsetInstances()

        if (this._olObject) {
          this._olObject[VM_PROP] = this._olObject[VM_PROP].filter(vm => vm !== this)
          this._olObject = undefined
        }

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
      try {
        await this.subscribeAll()

        this._olObjectState = STATE_MOUNTED

        this.$emit(EVENT_MOUNTED, this)

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`ol object ${EVENT_MOUNTED}`)
        }
      } catch (err) {
        this.$emit(EVENT_MOUNT_ERROR, this)

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.error(`ol object ${EVENT_MOUNT_ERROR}`, err)
        }

        throw err
      }
    },
    /**
     * @return {void|Promise<void>}
     * @protected
     */
    async unmount () {
      try {
        this._olObjectState = STATE_CREATED

        await this.unsubscribeAll()

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
     * @return {Promise<void>}
     */
    scheduleRefresh: debounce(function () {
      return this.refresh()
    }, 1000 / 60),
    /**
     * Internal usage only in components that doesn't support refreshing.
     * @return {Promise<void>}
     * @protected
     */
    async remount () {
      if (this.$olObjectState === STATE_MOUNTED) {
        await this.unmount()
      }

      await this.mount()
    },
    /**
     * @return {Promise<void>}
     */
    scheduleRemount: debounce(function () {
      return this.remount()
    }, 1000 / 60),
    /**
     * Only for internal purpose to support watching for properties
     * for which OpenLayers doesn't provide setters.
     * @return {Promise}
     * @protected
     */
    async recreate () {
      if (this.$olObjectState === STATE_MOUNTED) {
        await this.unmount()
        await this.deinit()
      }

      await this.init()
      await this.mount()
    },
    /**
     * @return {Promise<void>}
     */
    scheduleRecreate: debounce(function () {
      return this.recreate()
    }, 1000 / 60),
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
