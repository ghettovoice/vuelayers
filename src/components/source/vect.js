import Vue from 'vue'
import uuid from 'uuid/v4'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/merge'
import 'rxjs/add/operator/do'
import '../../rx-ext'
import { isPlainObject } from 'lodash/fp'
import { EPSG_4326, geoJson } from '../../ol-ext'
import source from './source'
import * as assert from '../../utils/assert'

const props = {
  projection: {
    type: String,
    default: EPSG_4326
  },
  useSpatialIndex: {
    type: Boolean,
    default: true
  }
}

const methods = {
  /**
   * @param {Array<(ol.Feature|Vue|GeoJSONFeature)>} features
   * @return {void}
   */
  addFeatures (features) {
    features.forEach(this.addFeature)
  },
  /**
   * @param {ol.Feature|Vue|GeoJSONFeature} feature
   * @return {void}
   */
  addFeature (feature) {
    assert.hasView(this)
    assert.hasSource(this)

    if (feature instanceof Vue) {
      feature = feature.$feature
    } else if (isPlainObject(feature)) {
      feature = geoJson.readFeature(feature, this.$view.getProjection())
    }
    this.$source.addFeature(this.prepareFeature(feature))
  },
  /**
   * @param {Array<(ol.Feature|Vue|GeoJSONFeature)>} features
   * @return {void}
   */
  removeFeatures (features) {
    features.forEach(this.removeFeature)
  },
  /**
   * @param {ol.Feature|Vue|GeoJSONFeature} feature
   * @return {void}
   */
  removeFeature (feature) {
    assert.hasSource(this)

    if (feature instanceof Vue) {
      feature = feature.$feature
    } else if (isPlainObject(feature)) {
      feature = this.$source.getFeatureById(feature.id)
    }
    this.$source.removeFeature(feature)
  },
  /**
   * @return {void}
   */
  clear () {
    assert.hasSource(this)
    this.$source.clear()
  },
  /**
   * @return {void}
   * @private
   */
  defineAccessors () {
    this::source.methods.defineAccessors()
    Object.defineProperties(this, {
      $features: {
        enumerable: true,
        get: this.getFeatures
      }
    })
  },
  /**
   * @param {string|number} id
   * @return {ol.Feature|undefined}
   */
  getFeatureById (id) {
    assert.hasSource(this)

    return this.$source.getFeatureById(id)
  },
  /**
   * @return {ol.Collection<ol.Feature>}
   * @throws {AssertionError}
   */
  getFeatures () {
    assert.hasSource(this)

    return this.$source.getFeaturesCollection()
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
   * @param {ol.Feature} feature
   * @return {ol.Feature}
   * @protected
   */
  prepareFeature (feature) {
    if (feature.getId() == null) {
      feature.setId(uuid())
    }

    return feature
  },
  /**
   * @return {void}
   * @protected
   */
  subscribeAll () {
    this::subscribeToSourceChanges()
  }
}

export default {
  mixins: [source],
  props,
  methods,
  stubVNode: {
    empty: false,
    attrs () {
      return {
        class: this.$options.name
      }
    }
  }
}

function subscribeToSourceChanges () {
  assert.hasSource(this)

  const add = Observable.fromOlEvent(this.$source, 'addfeature')
    .do(evt => {
      this.prepareFeature(evt.feature)
    })
  const remove = Observable.fromOlEvent(this.$source, 'removefeature')
  const events = Observable.merge(add, remove)

  this.subscribeTo(events, evt => this.$emit(evt.type, evt))
}
