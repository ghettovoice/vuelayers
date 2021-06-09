import { Collection } from 'ol'
import CollectionEventType from 'ol/CollectionEventType'
import { Control, defaults as createDefaultControls } from 'ol/control'
import { getUid } from 'ol/util'
import { merge as mergeObs } from 'rxjs'
import { map as mapObs, tap } from 'rxjs/operators'
import { getControlId, initializeControl } from '../ol-ext'
import { bufferDebounceTime, fromOlChangeEvent as obsFromOlChangeEvent, fromOlEvent as obsFromOlEvent } from '../rx-ext'
import { find, forEach, instanceOf, isArray, isPlainObject } from '../utils'
import identMap from './ident-map'
import { FRAME_TIME, makeChangeOrRecreateWatchers } from './ol-cmp'
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
     * @type {string|undefined}
     */
    controlsCollectionIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'controls_collection')
    },
  },
  watch: {
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'controlsCollectionIdent',
    ]),
  },
  created () {
    /**
     * @type {module:ol/Collection~Collection<module:ol/control/Control~Control>}
     * @private
     */
    this._controlsCollection = this.instanceFactoryCall(this.controlsCollectionIdent, () => new Collection())
    this._controlSubs = {}

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
     */
    initDefaultControls (defaultControls) {
      this.getControls().forEach(control => {
        if (control.get('vl_default')) {
          this.removeControl(control)
        }
      })

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
        controls.forEach(control => control.set('vl_default', true))
        this.addControls(controls)
      }
    },
    /**
     * @param {ControlLike} control
     * @return {Control}
     */
    initializeControl (control) {
      control = control?.$control || control
      instanceOf(control, Control)

      return initializeControl(control)
    },
    /**
     * @param {ControlLike[]|module:ol/Collection~Collection<ControlLike>} controls
     */
    addControls (controls) {
      forEach(controls, ::this.addControl)
    },
    /**
     * @param {ControlLike} control
     */
    addControl (control) {
      control = this.initializeControl(control)

      if (this.getControlById(getControlId(control))) return

      this.$controlsCollection.push(control)
    },
    /**
     * @param {ControlLike[]|module:ol/Collection~Collection<ControlLike>} controls
     */
    removeControls (controls) {
      forEach(controls, ::this.removeControl)
    },
    /**
     * @param {ControlLike} control
     */
    removeControl (control) {
      control = this.getControlById(getControlId(control?.$control || control))
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
      return this.$controlsCollection.getArray().slice()
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
    /**
     * @param {string|undefined} value
     * @param {string|undefined} prevValue
     * @protected
     */
    controlsCollectionIdentChanged (value, prevValue) {
      if (value && prevValue) {
        this.moveInstance(value, prevValue)
      } else if (value && !prevValue && this.$controlsCollection) {
        this.setInstance(value, this.$controlsCollection)
      } else if (!value && prevValue) {
        this.unsetInstance(prevValue)
      }
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
    mapObs(evt => ({
      ...evt,
      element: this.initializeControl(evt.element),
    })),
    tap(({ element }) => {
      const uid = getUid(element)
      const propChanges = obsFromOlChangeEvent(element, 'id', true)
      this._controlSubs[uid] = this.subscribeTo(propChanges, ::this.scheduleRefresh)
    }),
  )
  const removes = obsFromOlEvent(this.$controlsCollection, CollectionEventType.REMOVE).pipe(
    tap(({ element }) => {
      const uid = getUid(element)
      if (this._controlSubs[uid]) {
        this.unsubscribe(this._controlSubs[uid])
        delete this._controlSubs[uid]
      }
    }),
  )
  const events = mergeObs(adds, removes).pipe(
    bufferDebounceTime(FRAME_TIME),
  )
  this.subscribeTo(events, async events => {
    await this.debounceChanged()
    forEach(events, ({ type, element }) => {
      this.$emit(type + 'control', element)
      // todo remove in v0.13.x
      this.$emit(type + ':control', element)
    })
  })
}
