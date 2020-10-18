import debounce from 'debounce-promise'
import { Collection } from 'ol'
import CollectionEventType from 'ol/CollectionEventType'
import { Control, defaults as createDefaultControls } from 'ol/control'
import { from as fromObs, merge as mergeObs } from 'rxjs'
import { map as mapObs, mergeMap } from 'rxjs/operators'
import { getControlId, initializeControl } from '../ol-ext'
import { bufferDebounceTime, fromOlEvent as obsFromOlEvent } from '../rx-ext'
import { find, forEach, instanceOf, isArray, isEqual, isFunction, isPlainObject, map, sequential } from '../utils'
import identMap from './ident-map'
import { FRAME_TIME } from './ol-cmp'
import rxSubs from './rx-subs'

/**
 * @typedef {module:ol/control/Control~Control|Object} ControlLike
 */

/**
 * Controls collection
 */
export default {
  mixins: [
    identMap,
    rxSubs,
  ],
  computed: {
    /**
     * @returns {string[]}
     */
    currentControls () {
      if (!this.rev) return []

      return map(this.getControls(), getControlId)
    },
    /**
     * @type {string|undefined}
     */
    controlsCollectionIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'controls_collection')
    },
  },
  watch: {
    currentControls: /*#__PURE__*/debounce(function (value, prev) {
      if (isEqual(value, prev)) return

      this.$emit('update:controls', value.slice())
    }, FRAME_TIME),
    controlsCollectionIdent: /*#__PURE__*/sequential(function (value, prevValue) {
      if (value && prevValue) {
        this.moveInstance(value, prevValue)
      } else if (value && !prevValue && this.$controlsCollection) {
        this.setInstance(value, this.$controlsCollection)
      } else if (!value && prevValue) {
        this.unsetInstance(prevValue)
      }
    }),
  },
  created () {
    /**
     * @type {module:ol/Collection~Collection<module:ol/control/Control~Control>}
     * @private
     */
    this._controlsCollection = this.instanceFactoryCall(this.controlsCollectionIdent, () => new Collection())

    this::defineServices()
  },
  methods: {
    /**
     * @returns {{readonly controlsContainer: Object}}
     * @protected
     */
    getServices () {
      const vm = this

      return {
        get controlsContainer () { return vm },
      }
    },
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToCollectionEvents()
    },
    /**
     * @param {ControlLike[]|module:ol/Collection~Collection<ControlLike>} defaultControls
     * @returns {Promise<void>}
     */
    async initDefaultControls (defaultControls) {
      this.clearControls()

      let controls
      if (isArray(defaultControls) || defaultControls instanceof Collection) {
        controls = defaultControls
      } else if (defaultControls !== false) {
        controls = createDefaultControls(
          isPlainObject(defaultControls)
            ? defaultControls
            : undefined,
        )
      }
      if (controls) {
        await this.addControls(controls)
      }
    },
    /**
     * @param {ControlLike} control
     * @return {Promise<Control>}
     */
    async initializeControl (control) {
      if (isFunction(control.resolveOlObject)) {
        control = await control.resolveOlObject()
      }

      return initializeControl(control)
    },
    /**
     * @param {ControlLike[]|module:ol/Collection~Collection<ControlLike>} controls
     * @returns {Promise<void>}
     */
    async addControls (controls) {
      await Promise.all(map(controls, ::this.addControl))
    },
    /**
     * @param {ControlLike} control
     * @returns {Promise<void>}
     */
    async addControl (control) {
      control = await this.initializeControl(control)
      instanceOf(control, Control)

      if (this.getControlById(getControlId(control))) return

      this.$controlsCollection.push(control)
    },
    /**
     * @param {ControlLike[]|module:ol/Collection~Collection<ControlLike>} controls
     * @returns {Promise<void>}
     */
    async removeControls (controls) {
      await Promise.all(map(controls, ::this.removeControl))
    },
    /**
     * @param {ControlLike} control
     * @returns {Promise<void>}
     */
    async removeControl (control) {
      if (isFunction(control.resolveOlObject)) {
        control = await control.resolveOlObject()
      }

      control = this.getControlById(getControlId(control))
      if (!control) return

      this.$controlsCollection.remove(control)
    },
    /**
     * @return {void}
     */
    clearControls () {
      this.$controlsCollection.clear()
    },
    /**
     * @returns {Array<module:ol/control/Control~Control>}
     */
    getControls () {
      return this.$controlsCollection.getArray()
    },
    /**
     * @returns {module:ol/Collection~Collection<module:ol/control/Control~Control>}
     */
    getControlsCollection () {
      return this._controlsCollection
    },
    /**
     * @param {string|number} controlId
     * @returns {ControlLike}
     */
    getControlById (controlId) {
      return find(this.getControls(), control => getControlId(control) === controlId)
    },
  },
}

function defineServices () {
  Object.defineProperties(this, {
    $controlsCollection: {
      enumerable: true,
      get: this.getControlsCollection,
    },
  })
}

function subscribeToCollectionEvents () {
  const adds = obsFromOlEvent(this.$controlsCollection, CollectionEventType.ADD).pipe(
    mergeMap(({ type, element }) => fromObs(this.initializeControl(element)).pipe(
      mapObs(element => ({ type, element })),
    )),
  )
  const removes = obsFromOlEvent(this.$controlsCollection, CollectionEventType.REMOVE)
  const events = mergeObs(adds, removes).pipe(
    bufferDebounceTime(FRAME_TIME),
  )
  this.subscribeTo(events, events => {
    ++this.rev

    this.$nextTick(() => {
      forEach(events, ({ type, element }) => {
        this.$emit(type + 'control', element)
        // todo remove in v0.13.x
        this.$emit(type + ':control', element)
      })
    })
  })
}
