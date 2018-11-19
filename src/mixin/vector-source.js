import { merge as mergeObs } from 'rxjs/observable'
import { debounceTime, tap } from 'rxjs/operators'
import { SourceCollectionAdapter } from '../ol-ext/collection'
import observableFromOlEvent from '../rx-ext/from-ol-event'
import * as assert from '../util/assert'
import mergeDescriptors from '../util/multi-merge-descriptors'
import featuresContainer from './features-container'
import projTransforms from './proj-transforms'
import source from './source'

const props = {
  useSpatialIndex: {
    type: Boolean,
    default: true,
  },
}

const computed = {
  featuresViewProj () {
    if (this.rev && this.resolvedDataProjection && this.$source) {
      return this.getFeatures().map(::this.writeFeatureInViewProj)
    }
    return []
  },
}

const methods = {
  /**
   * @return {void}
   */
  clear () {
    this::featuresContainer.methods.clearFeatures()
  },
  /**
   * @return {SourceCollectionAdapter}
   * @protected
   */
  getFeaturesTarget () {
    if (this._featuresTarget == null && this.$source) {
      this._featuresTarget = new SourceCollectionAdapter(this.$source)
    }

    return this._featuresTarget
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
    this::source.methods.mount()
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    this.clear()
    this::source.methods.unmount()
  },
  /**
   * @return {void}
   * @protected
   */
  subscribeAll () {
    this::subscribeToSourceChanges()
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
}

export default {
  mixins: [source, featuresContainer, projTransforms],
  props,
  computed,
  methods,
  stubVNode: {
    empty: false,
    attrs () {
      return {
        class: this.$options.name,
      }
    },
  },
}

function subscribeToSourceChanges () {
  assert.hasSource(this)

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
