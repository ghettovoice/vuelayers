import Collection from 'ol/Collection'
import Feature from 'ol/Feature'
import Vue from 'vue'
import { getFeatureId, initializeFeature } from '../ol-ext'
import { instanceOf } from '../util/assert'
import { forEach, isPlainObject } from '../util/minilo'
import projTransforms from './proj-transforms'

export default {
  mixins: [projTransforms],
  methods: {
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
        initializeFeature(feature)
        this._featuresCollection.push(feature)
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

      this._featuresCollection.remove(feature)
    },
    /**
     * @return {void}
     */
    clearFeatures () {
      this._featuresCollection.clear()
    },
    /**
     * @param {string|number} featureId
     * @return {module:ol/Feature~Feature|undefined}
     */
    getFeatureById (featureId) {
      return this._featuresCollection.getArray().find(feature => {
        return getFeatureId(feature) === featureId
      })
    },
    /**
     * @return {module:ol/Feature~Feature[]}
     */
    getFeatures () {
      return this._featuresCollection.toArray()
    },
    /**
     * @return {module:ol/Collection~Collection<module:ol/Feature~Feature>>}
     */
    getFeaturesCollection () {
      return this._featuresCollection
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
  },
  created () {
    /**
     * @type {module:ol/Collection~Collection<module:ol/Feature~Feature>>}
     * @private
     */
    this._featuresCollection = new Collection()
    // todo subscribe to collection
  },
}
