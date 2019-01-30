import Collection from 'ol/Collection'
import Feature from 'ol/Feature'
import Vue from 'vue'
import { getFeatureId, identifyFeature } from '../ol-ext'
import { instanceOf } from '../util/assert'
import { isPlainObject, forEach } from '../util/minilo'
import projTransforms from './proj-transforms'

const methods = {
  /**
   * @param {Array<(module:ol/Feature~Feature|Vue|Object)>} features
   * @return {void}
   */
  addFeatures (features) {
    forEach(features, ::this.addFeature)
  },
  /**
   * @param {module:ol/Feature~Feature|Vue|Object} feature
   * @return {void}
   */
  addFeature (feature) {
    if (feature instanceof Vue) {
      feature = feature.$feature
    } else if (isPlainObject(feature)) {
      feature = this.readFeatureInDataProj(feature)
    }
    instanceOf(feature, Feature)

    if (this.getFeatureById(getFeatureId(feature)) == null) {
      identifyFeature(feature)
      this._featureCollection.push(feature)
    }
  },
  /**
   * @param {Array<(module:ol/Feature~Feature|Vue|Object)>} features
   * @return {void}
   */
  removeFeatures (features) {
    forEach(features, ::this.removeFeature)
  },
  /**
   * @param {module:ol/Feature~Feature|Vue|Object} feature
   * @return {void}
   */
  removeFeature (feature) {
    feature = this.getFeatureById(getFeatureId(feature))
    if (!feature) return

    this._featureCollection.remove(feature)
  },
  /**
   * @return {void}
   */
  clearFeatures () {
    this._featureCollection.clear()
  },
  /**
   * @param {string|number} id
   * @return {module:ol/Feature~Feature|undefined}
   */
  getFeatureById (id) {
    return this._featureCollection.getArray().find(feature => {
      return getFeatureId(feature) === id
    })
  },
  /**
   * @return {module:ol/Feature~Feature[]}
   */
  getFeatures () {
    return this._featureCollection.toArray()
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
}

export default {
  mixins: [projTransforms],
  methods,
  created () {
    /**
     * @type {module:ol/Collection~Collection}
     * @private
     */
    this._featureCollection = new Collection()
    // todo subscribe to collection
  },
}
