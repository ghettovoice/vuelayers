import { merge as mergeObs } from 'rxjs/observable'
import { debounceTime } from 'rxjs/operators'
import { observableFromOlEvent } from '../rx-ext'
import * as assert from '../util/assert'
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
    ], () => function () {
      return this.scheduleRecreate()
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

  const add = observableFromOlEvent(this.getFeaturesCollection(), 'add')
  const remove = observableFromOlEvent(this.getFeaturesCollection(), 'remove')
  const events = mergeObs(add, remove).pipe(debounceTime(1000 / 60))
  // emit event to allow `sync` modifier
  this.subscribeTo(events, () => {
    this.$emit('update:features', this.featuresDataProj)
  })

  // todo only for backward compatibility, remove later
  this.subscribeTo(mergeObs(
    observableFromOlEvent(this.$source, 'addfeature'),
    observableFromOlEvent(this.$source, 'removefeature'),
    observableFromOlEvent(this.$source, 'changefeature')
  ), evt => {
    this.$emit(evt.type, evt)
  })
}
