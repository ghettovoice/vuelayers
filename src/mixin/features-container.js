import Feature from 'ol/feature'
import Vue from 'vue'
import { initFeature } from '../ol-ext/feature'
import { instanceOf } from '../util/assert'
import { isPlainObject } from '../util/minilo'
import projTransforms from './proj-transforms'

const methods = {
  /**
   * @return {IndexedCollectionAdapter|SourceCollectionAdapter}
   * @protected
   */
  getFeaturesTarget () {
    throw new Error('Not implemented method')
  },
  /**
   * @param {Array<(ol.Feature|Vue|GeoJSONFeature)>} features
   * @return {void}
   */
  addFeatures (features) {
    features.forEach(::this.addFeature)
  },
  /**
   * @param {ol.Feature|Vue|GeoJSONFeature} feature
   * @return {void}
   */
  addFeature (feature) {
    if (feature instanceof Vue) {
      feature = feature.$feature
    } else if (isPlainObject(feature)) {
      feature = this.readFeatureInDataProj(feature)
    }
    instanceOf(feature, Feature)

    this.prepareFeature(feature)

    if (!this.getFeaturesTarget().has(feature)) {
      this.getFeaturesTarget().add(feature)
    }
  },
  /**
   * @param {Array<(ol.Feature|Vue|GeoJSONFeature)>} features
   * @return {void}
   */
  removeFeatures (features) {
    features.forEach(::this.removeFeature)
  },
  /**
   * @param {ol.Feature|Vue|GeoJSONFeature} feature
   * @return {void}
   */
  removeFeature (feature) {
    if (feature instanceof Vue) {
      feature = feature.$feature
    } else if (isPlainObject(feature)) {
      // feature = this._features[feature.id]
      feature = this.getFeatureById(feature.id)
    }
    if (!feature) return

    if (this.getFeaturesTarget().has(feature)) {
      this.getFeaturesTarget().remove(feature)
    }
  },
  /**
   * @return {void}
   */
  clearFeatures () {
    this.getFeaturesTarget().clear()
  },
  /**
   * @param {string|number} id
   * @return {ol.Feature|undefined}
   */
  getFeatureById (id) {
    return this.getFeaturesTarget().findByKey(id)
  },
  /**
   * @return {ol.Feature[]}
   */
  getFeatures () {
    return this.getFeaturesTarget().elements
  },
  /**
   * @returns {Object}
   * @protected
   */
  getServices () {
    const vm = this

    return {
      get featuresContainer () { return vm },
    }
  },
  /**
   * @param {ol.Feature} feature
   * @return {ol.Feature}
   * @protected
   */
  prepareFeature (feature) {
    return initFeature(feature)
  },
}

export default {
  mixins: [projTransforms],
  methods,
}
