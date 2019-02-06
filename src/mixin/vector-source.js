import { merge as mergeObs } from 'rxjs/observable'
import { debounceTime, tap } from 'rxjs/operators'
import { observableFromOlEvent } from '../rx-ext'
import * as assert from '../util/assert'
import { isEqual } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import { makeWatchers } from '../util/vue-helpers'
import featuresContainer from './features-container'
import projTransforms from './proj-transforms'
import source from './source'

export default {
  mixins: [source, featuresContainer, projTransforms],
  props: {
    useSpatialIndex: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    featuresViewProj () {
      if (!this.rev || !this.resolvedDataProjection || !this.$source) {
        return []
      }

      return this.getFeatures().map(::this.writeFeatureInViewProj)
    },
  },
  methods: {
    /**
     * @return {void}
     */
    clear () {
      this::featuresContainer.methods.clearFeatures()
    },
    /**
     * @return {Object}
     * @protected
     */
    getServices () {
      return mergeDescriptors(
        this::source.methods.getServices(),
        this::featuresContainer.methods.getServices(),
      )
    },
    /**
     * @return {Promise}
     * @protected
     */
    init () {
      return this::source.methods.init()
    },
    /**
     * @return {void|Promise<void>}
     * @protected
     */
    deinit () {
      return this::source.methods.deinit()
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      return this::source.methods.mount()
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.clear()
      return this::source.methods.unmount()
    },
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::source.methods.subscribeAll()
      this::subscribeToEvents()
    },
    /**
     * @param feature
     * @return {ReadonlyArray<any>}
     * @protected
     */
    writeFeatureInDataProj (feature) {
      return this::projTransforms.methods.writeFeatureInDataProj(feature)
    },
    /**
     * @param feature
     * @return {ReadonlyArray<any>}
     * @protected
     */
    writeGeometryInViewProj (feature) {
      return this::projTransforms.methods.writeFeatureInViewProj(feature)
    },
  },
  watch: {
    ...makeWatchers([
      'useSpatialIndex',
    ], () => function (value, prevValue) {
      if (isEqual(value, prevValue)) return

      this.scheduleRecreate()
    }),
  },
  stubVNode: {
    empty: false,
    attrs () {
      return {
        class: this.$options.name,
      }
    },
  },
}

function subscribeToEvents () {
  assert.hasSource(this)
  // todo most likely it is no longer necessary cause this.$source will use this._featuresCollection
  const add = observableFromOlEvent(this.$source, 'addfeature').pipe(
    tap(({ feature }) => {
      this.addFeature(feature)
    }),
  )
  const remove = observableFromOlEvent(this.$source, 'removefeature').pipe(
    tap(({ feature }) => {
      this.removeFeature(feature)
    }),
  )
  const changeFeature = observableFromOlEvent(this.$source, 'changefeature')

  const events = mergeObs(add, remove, changeFeature)

  this.subscribeTo(events, evt => {
    ++this.rev
    this.$emit(evt.type, evt)
  })
  // emit event to allow `sync` modifier
  this.subscribeTo(events.pipe(debounceTime(100)), () => {
    this.$emit('update:features', this.getFeatures().map(::this.writeFeatureInDataProj))
  })
}
