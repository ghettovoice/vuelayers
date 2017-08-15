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

    if (feature instanceof Vue) {
      feature = feature.$feature
    } else if (isPlainObject(feature)) {
      feature = geoJson.readFeature(feature, this.$view.getProjection())
    }

    this.prepareFeature(feature)

    if (!this._features[feature.getId()]) {
      this._features[feature.getId()] = feature
    }
    if (this.$source && !this.$source.getFeatureById(feature.getId())) {
      this.$source.addFeature(feature)
    }
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
    if (feature instanceof Vue) {
      feature = feature.$feature
    } else if (isPlainObject(feature)) {
      feature = this._features[feature.id]
    }

    if (!feature) return

    delete this._features[feature.getId()]

    if (this.$source && this.$source.getFeatureById(feature.getId())) {
      this.$source.removeFeature(feature)
    }
  },
  /**
   * @return {void}
   */
  clear () {
    this._features = Object.create(null)
    this.$source && this.$source.clear()
  },
  /**
   * @param {string|number} id
   * @return {ol.Feature|undefined}
   */
  getFeatureById (id) {
    return this._features[id]
  },
  /**
   * @return {ol.Feature[]}
   */
  getFeatures () {
    return Object.values(this._features)
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
  },
  created () {
    /**
     * @type {Object<string, ol.Feature>}
     * @private
     */
    this._features = Object.create(null)

    Object.defineProperties(this, {
      $features: {
        enumerable: true,
        get: this.getFeatures
      }
    })
  },
  destroyed () {
    this._features = Object.create(null)
  }
}

function subscribeToSourceChanges () {
  assert.hasSource(this)

  let events
  let eventsIdent = this.getFullIdent('events')

  if (this.$identityMap.has(eventsIdent)) {
    events = this.$identityMap.get(eventsIdent)
  } else {
    const add = Observable.fromOlEvent(this.$source, 'addfeature')
      .do(({ feature }) => {
        this.addFeature(feature)
      })
    const remove = Observable.fromOlEvent(this.$source, 'removefeature')
      .do(({ feature }) => {
        this.removeFeature(feature)
      })
    events = Observable.merge(add, remove).share()

    if (eventsIdent) {
      this.$identityMap.set(eventsIdent, events)
    }
  }

  this.subscribeTo(events, evt => this.$emit(evt.type, evt))
}
