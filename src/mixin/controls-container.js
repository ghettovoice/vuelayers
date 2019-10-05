import { Collection } from 'ol'
import { Control, defaults as createDefaultControls } from 'ol/control'
import { observableFromOlEvent } from '../rx-ext'
import { merge as mergeObs } from 'rxjs/observable'
import Vue from 'vue'
import { getControlId, initializeControl } from '../ol-ext'
import { instanceOf } from '../util/assert'
import { isArray, isPlainObject } from '../util/minilo'
import rxSubs from './rx-subs'

export default {
  mixins: [rxSubs],
  computed: {
    controlIds () {
      if (!this.rev) return []

      return this.getControls().map(getControlId)
    },
  },
  methods: {
    initDefaultControls (defaultControls) {
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
        controls.forEach(::this.addControl)
      }
    },
    async addControl (control) {
      if (control instanceof Vue) {
        control = await control.resolveOlObject()
      }

      instanceOf(control, Control)

      if (this.getControlById(getControlId(control)) == null) {
        initializeControl(control)
        this.$controlsCollection.push(control)
      }
    },
    async removeControl (control) {
      if (control instanceof Vue) {
        control = await control.resolveOlObject()
      }

      control = this.getControlById(getControlId(control))
      if (control == null) return

      this.$controlsCollection.remove(control)
    },
    getControls () {
      return this.$controlsCollection.getArray()
    },
    getControlsCollection () {
      return this._controlsCollection
    },
    getControlById (controlId) {
      return this.getControls().find(control => {
        return getControlId(control) === controlId
      })
    },
    clearControls () {
      this.$controlsCollection.clear()
    },
    getServices () {
      const vm = this

      return {
        get controlsContainer () { return vm },
      }
    },
  },
  created () {
    this._controlsCollection = new Collection()

    this::defineServices()
    this::subscribeToCollectionEvents()
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
  const adds = observableFromOlEvent(this.$controlsCollection, 'add')
  const removes = observableFromOlEvent(this.$controlsCollection, 'remove')

  this.subscribeTo(mergeObs(adds, removes), ({ type, element }) => {
    ++this.rev

    this.$nextTick(() => {
      this.$emit(type + ':control', element)
    })
  })
}
