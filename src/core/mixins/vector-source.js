import { Observable } from 'rxjs/Observable'
import { merge as mergeObs } from 'rxjs/observable/merge'
import { _do as doObs } from 'rxjs/operator/do'
import { debounceTime } from 'rxjs/operator/debounceTime'
import featuresContainer from '../mixins/features-container'
import { EPSG_4326 } from '../ol-ext/consts'
import * as geoJsonHelper from '../ol-ext/geojson'
import observableFromOlEvent from '../rx-ext/from-ol-event'
import * as assert from '../utils/assert'
import mergeDescriptors from '../utils/multi-merge-descriptors'
import source from './source'
import projTransforms from './proj-transforms'

const props = {
  /**
   * Source data projection.
   * @type {string}
   * @default EPSG:4326
   */
  projection: {
    type: String,
    default: EPSG_4326,
  },
  useSpatialIndex: {
    type: Boolean,
    default: true,
  },
}

const computed = {
  viewProjFeatures () {
    if (this.rev && this.$source) {
      return this.getFeatures().map(feature => geoJsonHelper.writeFeature(feature))
    }
    return []
  },
}

const methods = {
  /**
   * @return {void}
   */
  clear () {
    this::featuresContainer.methods.clear()
    this.$source && this.$source.clear()
  },
  /**
   * @return {{
   *     addFeature: function(ol.Feature): void,
   *     removeFeature: function(ol.Feature): void,
   *     hasFeature: function(ol.Feature): bool
   *   }|undefined}
   * @protected
   */
  getFeaturesTarget () {
    if (!this.$source) return

    const source = this.$source

    return {
      hasFeature (feature) {
        return source.getFeatureById(feature.getId()) != null
      },
      addFeature (feature) {
        source.addFeature(feature)
      },
      removeFeature (feature) {
        source.removeFeature(feature)
      },
    }
  },
  /**
   * @return {Object}
   * @protected
   */
  getServices () {
    return mergeDescriptors(
      this::source.methods.getServices(),
      this::featuresContainer.methods.getServices()
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
    this::source.methods.unmount()
  },
  /**
   * @return {void}
   * @protected
   */
  subscribeAll () {
    this::subscribeToSourceChanges()
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

  const add = observableFromOlEvent(this.$source, 'addfeature')
    ::doObs(({ feature }) => {
      this.addFeature(feature)
    })
  const remove = observableFromOlEvent(this.$source, 'removefeature')
    ::doObs(({ feature }) => {
      this.removeFeature(feature)
    })

  const events = Observable::mergeObs(add, remove)

  this.subscribeTo(events, evt => this.$emit(evt.type, evt))
  // emit event to allow `sync` modifier
  this.subscribeTo(events::debounceTime(100), () => {
    ++this.rev
    this.$emit('update:features', this.getFeatures().map(::this.writeFeatureInBindProj))
  })
}
