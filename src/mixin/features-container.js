import Feature from 'ol/feature'
import uuid from 'uuid/v4'
import Vue from 'vue'
import { instanceOf } from '../util/assert'
import { isPlainObject } from '../util/minilo'
import projTransforms from './proj-transforms'

const methods = {
  /**
   * @return {FeaturesTarget}
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
      feature = this.readFeatureInBindProj(feature)
    }
    instanceOf(feature, Feature)

    this.prepareFeature(feature)

    // if (!this._features[feature.getId()]) {
    //   this._features[feature.getId()] = feature
    // }

    // const featuresTarget = this.getFeaturesTarget()
    // if (featuresTarget && !featuresTarget.hasFeature(feature)) {
    //   featuresTarget.addFeature(feature)
    // }
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

    // delete this._features[feature.getId()]

    // const featuresTarget = this.getFeaturesTarget()
    // if (featuresTarget && featuresTarget.hasFeature(feature)) {
    //   featuresTarget.removeFeature(feature)
    // }
    if (this.getFeaturesTarget().has(feature)) {
      this.getFeaturesTarget().remove(feature)
    }
  },
  /**
   * @return {void}
   */
  clear () {
    // this._features = Object.create(null)
    this.getFeaturesTarget().clear()
  },
  /**
   * @param {string|number} id
   * @return {ol.Feature|undefined}
   */
  getFeatureById (id) {
    // return this._features[id]
    return this.getFeaturesTarget().getById(id)
  },
  /**
   * @return {ol.Feature[]}
   */
  getFeatures () {
    // return Object.values(this._features)
    return this.getFeaturesTarget().all()
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

export const featuresContainer = {
  mixins: [projTransforms],
  methods,
  created () {
    /**
     * Internal hashmap of features ids to indexes.
     * @type {Object<string, ol.Feature>}
     * @private
     */
    // this._features = Object.create(null)
  },
  destroyed () {
    this.clear()
  },
}

/**
 * @interface FeaturesTarget
 */
/**
 * @function
 * @name FeaturesTarget#add
 * @param {ol.Feature} feature
 * @return {void}
 */
/**
 * @function
 * @name FeaturesTarget#remove
 * @param {ol.Feature} feature
 * @return {void}
 */
/**
 * @function
 * @name FeaturesTarget#has
 * @param {ol.Feature} feature
 * @return {boolean}
 */
/**
 * @function
 * @name FeaturesTarget#clear
 * @return {void}
 */
/**
 * @function
 * @name FeaturesTarget#getById
 * @param {*} id
 * @return {ol.Feature|undefined}
 */
/**
 * @function
 * @name FeaturesTarget#all
 * @return {ol.Feature[]}
 */
/**
 * @function
 * @name FeaturesTarget#getAdaptee
 * @return {*}
 */

/**
 * @implements FeaturesTarget
 */
export class CollectionFeaturesTarget {
  /**
   * @param {ol.Collection} collection
   */
  constructor (collection) {
    /**
     * @type {ol.Collection}
     * @private
     */
    this._target = collection
    /**
     * @type {Object<mixed, number>}
     * @private
     */
    this._index = Object.create(null)
  }

  /**
   * @return {ol.Collection}
   */
  getAdaptee () {
    return this._target
  }

  /**
   * @param {ol.Feature} feature
   */
  add (feature) {
    let length = this._target.push(feature)
    this._index[feature.getId()] = length - 1
  }

  /**
   * @param {ol.Feature} feature
   */
  remove (feature) {
    if (this._target.remove(feature)) {
      delete this._index[feature.getId()]
    }
  }

  /**
   * @param {ol.Feature} feature
   * @return {boolean}
   */
  has (feature) {
    return !!this.getById(feature.getId())
  }

  /**
   * @return {void}
   */
  clear () {
    this._target.clear()
  }

  /**
   * @param {*} id
   * @return {ol.Feature|undefined}
   */
  getById (id) {
    if (this._index[id] == null) return

    return this._target.item(this._index[id])
  }

  /**
   * @return {ol.Feature[]}
   */
  all () {
    return this._target.getArray()
  }
}

/**
 * @implements FeaturesTarget
 */
export class SourceFeaturesTarget {
  /**
   * @param {ol.source.Vector} source
   */
  constructor (source) {
    /**
     * @type {ol.source.Vector}
     * @private
     */
    this._target = source
  }

  /**
   * @return {ol.source.Vector}
   */
  getAdaptee () {
    return this._target
  }

  /**
   * @param {ol.Feature} feature
   */
  add (feature) {
    this._target.addFeature(feature)
  }

  /**
   * @param {ol.Feature} feature
   */
  remove (feature) {
    this._target.removeFeature(feature)
  }

  /**
   * @param {ol.Feature} feature
   * @return {boolean}
   */
  has (feature) {
    return !!this.getById(feature.getId())
  }

  /**
   * @return {void}
   */
  clear () {
    this._target.clear()
  }

  /**
   * @param {*} id
   * @return {ol.Feature|undefined}
   */
  getById (id) {
    return this._target.getFeatureById(id)
  }

  /**
   * @return {ol.Feature[]}
   */
  all () {
    return this._target.getFeatures()
  }
}
