import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/merge'
import 'rxjs/add/operator/do'
import observableFromOlEvent from '../rx-ext/from-ol-event'
import { EPSG_4326 } from '../ol-ext/consts'
import source from './source'
import featuresContainer from '../mixins/features-container'
import * as assert from '../utils/assert'
import mergeDescriptors from '../utils/multi-merge-descriptors'

const props = {
  projection: {
    type: String,
    default: EPSG_4326,
  },
  useSpatialIndex: {
    type: Boolean,
    default: true,
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
  mixins: [source, featuresContainer],
  props,
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
    .do(({ feature }) => {
      this.addFeature(feature)
    })
  const remove = observableFromOlEvent(this.$source, 'removefeature')
    .do(({ feature }) => {
      this.removeFeature(feature)
    })

  const events = Observable.merge(add, remove)

  this.subscribeTo(events, evt => this.$emit(evt.type, evt))
}
