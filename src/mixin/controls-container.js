import { Collection } from 'ol'
import { Control, defaults as createDefaultControls } from 'ol/control'
import { merge as mergeObs } from 'rxjs/observable'
import Vue from 'vue'
import { getControlId, initializeControl } from '../ol-ext'
import { obsFromOlEvent } from '../rx-ext'
import { instanceOf } from '../util/assert'
import { isArray, isPlainObject, map } from '../util/minilo'
import rxSubs from './rx-subs'

export default {
  mixins: [rxSubs],
  computed: {
    controlIds () {
      if (!this.rev) return []

      return this.getControls().map(getControlId)
    },
  },
  created () {
    this._controlsCollection = new Collection()

    this::defineServices()
    this::subscribeToCollectionEvents()
  },
  methods: {
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
    async addControl (control) {
      initializeControl(control)

      if (control instanceof Vue) {
        control = await control.resolveOlObject()
      }

      instanceOf(control, Control)

      if (this.getControlById(getControlId(control)) == null) {
        this.$controlsCollection.push(control)
      }
    },
    async addControls (controls) {
      await Promise.all(map(controls, ::this.addControl))
    },
    async removeControl (control) {
      if (control instanceof Vue) {
        control = await control.resolveOlObject()
      }

      control = this.getControlById(getControlId(control))
      if (!control) return

      this.$controlsCollection.remove(control)
    },
    async removeControls (controls) {
      await Promise.all(map(controls, ::this.removeControl))
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
  const adds = obsFromOlEvent(this.$controlsCollection, 'add')
  const removes = obsFromOlEvent(this.$controlsCollection, 'remove')

  this.subscribeTo(mergeObs(adds, removes), ({ type, element }) => {
    ++this.rev

    this.$nextTick(() => {
      this.$emit(type + 'control', element)
    })
  })
}
