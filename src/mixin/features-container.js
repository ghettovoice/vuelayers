import Feature from 'ol/feature'
import uuid from 'uuid/v4'
import Vue from 'vue'
import { instanceOf } from '../util/assert'
import { isPlainObject } from '../util/minilo'
import projTransforms from './proj-transforms'

const methods = {
  /**
   * @return {{
   *     addFeature: function(ol.Feature): void,
   *     removeFeature: function(ol.Feature): void,
   *     hasFeature: function(ol.Feature): bool
   *   }|undefined}
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
    features.forEach(feature => this.addFeature(feature))
  },
  /**
   * @param {ol.Feature|Vue|GeoJSONFeature} feature
   * @return {void}
   */
  addFeature (feature) {
    if (feature instanceof Vue) {
      feature = feature.$feature
    } else if (isPlainObject(feature)) {
      feature = this.readFeatureInBindProj(feature)
    }
    instanceOf(feature, Feature)

    this.prepareFeature(feature)

    if (!this._features[feature.getId()]) {
      this._features[feature.getId()] = feature
    }

    const featuresTarget = this.getFeaturesTarget()
    if (featuresTarget && !featuresTarget.hasFeature(feature)) {
      featuresTarget.addFeature(feature)
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

    const featuresTarget = this.getFeaturesTarget()
    if (featuresTarget && featuresTarget.hasFeature(feature)) {
      featuresTarget.removeFeature(feature)
    }
  },
  /**
   * @return {void}
   */
  clear () {
    this._features = Object.create(null)
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
    if (feature.getId() == null) {
      feature.setId(uuid())
    }

    return feature
  },
}

export default {
  mixins: [projTransforms],
  methods,
  created () {
    /**
     * @type {Object<string, ol.Feature>}
     * @private
     */
    this._features = Object.create(null)
  },
  destroyed () {
    this._features = Object.create(null)
  },
}
