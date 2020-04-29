import { Collection, Feature, getUid as getObjectUid } from 'ol'
import { merge as mergeObs } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { getFeatureId, initializeFeature, mergeFeatures } from '../ol-ext'
import { obsFromOlEvent } from '../rx-ext'
import { instanceOf } from '../util/assert'
import { isFunction, isPlainObject, map } from '../util/minilo'
import identMap from './ident-map'
import projTransforms from './proj-transforms'
import rxSubs from './rx-subs'

/**
 * @typedef {module:ol/Feature~Feature|Object} FeatureLike
 */

/**
 * Features container
 */
export default {
  mixins: [
    identMap,
    rxSubs,
    projTransforms,
  ],
  computed: {
    /**
     * @type {Array<string|number>}
     */
    featureIds () {
      if (!this.rev) return []

      return this.getFeatures().map(getFeatureId)
    },
    /**
     * @type {Object[]}
     */
    featuresViewProj () {
      if (!this.rev) return []

      return this.getFeatures().map(::this.writeFeatureInViewProj)
    },
    /**
     * @type {Object[]}
     */
    featuresDataProj () {
      if (!this.rev) return []

      return this.getFeatures().map(::this.writeFeatureInDataProj)
    },
    /**
     * @returns {string|undefined}
     */
    featuresCollectionIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'features_collection')
    },
  },
  watch: {
    featuresCollectionIdent (value, prevValue) {
      if (value && prevValue) {
        this.moveInstance(value, prevValue)
      } else if (value && !prevValue && this.$featuresCollection) {
        this.setInstance(value, this.$featuresCollection)
      } else if (!value && prevValue) {
        this.unsetInstance(prevValue)
      }
    },
  },
  created () {
    /**
     * @type {module:ol/Collection~Collection<module:ol/Feature~Feature>}
     * @private
     */
    this._featuresCollection = this.instanceFactoryCall(this.featuresCollectionIdent, () => new Collection())
    this._featureSubs = {}

    this::defineServices()
    this::subscribeToCollectionEvents()
  },
  methods: {
    /**
     * @param {FeatureLike[]|module:ol/Collection~Collection<FeatureLike>} features
     * @return {Promise<void>}
     */
    async addFeatures (features) {
      await Promise.all(map(features, ::this.addFeature))
    },
    /**
     * @param {FeatureLike} feature
     * @return {Promise<void>}
     */
    async addFeature (feature) {
      initializeFeature(feature)

      if (isFunction(feature.resolveOlObject)) {
        feature = await feature.resolveOlObject()
      } else if (isPlainObject(feature)) {
        feature = this.readFeatureInDataProj(feature)
      }

      instanceOf(feature, Feature)
      // todo add hash {featureId => featureIdx, ....}
      const foundFeature = this.getFeatureById(getFeatureId(feature))
      if (foundFeature == null) {
        this.$featuresCollection.push(feature)
      } else {
        mergeFeatures(foundFeature, feature)
      }
    },
    /**
     * @param {FeatureLike[]|module:ol/Collection~Collection<FeatureLike>} features
     * @return {Promise<void>}
     */
    async removeFeatures (features) {
      await Promise.all(map(features, ::this.removeFeature))
    },
    /**
     * @param {FeatureLike} feature
     * @return {Promise<void>}
     */
    async removeFeature (feature) {
      if (isFunction(feature.resolveOlObject)) {
        feature = await feature.resolveOlObject()
      }

      feature = this.getFeatureById(getFeatureId(feature))
      if (!feature) return

      this.$featuresCollection.remove(feature)
    },
    /**
     * @return {void}
     */
    clearFeatures () {
      this.$featuresCollection.clear()
    },
    /**
     * @param {string|number} featureId
     * @return {module:ol/Feature~Feature|undefined}
     */
    getFeatureById (featureId) {
      // todo add hash {featureId => featureIdx, ....}
      return this.$featuresCollection.getArray().find(feature => {
        return getFeatureId(feature) === featureId
      })
    },
    /**
     * @return {Array<module:ol/Feature~Feature>}
     */
    getFeatures () {
      return this.$featuresCollection.getArray()
    },
    /**
     * @return {module:ol/Collection~Collection<module:ol/Feature~Feature>}
     */
    getFeaturesCollection () {
      return this._featuresCollection
    },
    /**
     * @param {module:ol/Collection~Collection<module:ol/Feature~Feature>} feature
     * @return {boolean}
     */
    hasFeature (feature) {
      return this.getFeatureById(getFeatureId(feature)) != null
    },
    /**
     * @returns {boolean}
     */
    isEmpty () {
      return this.getFeatures().length === 0
    },
    /**
     * @returns {{readonly featuresContainer: Object}}
     * @protected
     */
    getServices () {
      const vm = this

      return {
        get featuresContainer () { return vm },
      }
    },
  },
}

function defineServices () {
  Object.defineProperties(this, {
    $featuresCollection: {
      enumerable: true,
      get: this.getFeaturesCollection,
    },
  })
}

function subscribeToCollectionEvents () {
  const adds = obsFromOlEvent(this.$featuresCollection, 'add')
  this.subscribeTo(adds, ({ element }) => {
    const elementUid = getObjectUid(element)
    const propChanges = obsFromOlEvent(element, 'propertychange')
    const otherChanges = obsFromOlEvent(element, 'change')
    const featureChanges = mergeObs(propChanges, otherChanges).pipe(
      debounceTime(1000 / 60),
    )

    this._featureSubs[elementUid] = this.subscribeTo(featureChanges, () => {
      ++this.rev
    })

    ++this.rev

    this.$nextTick(() => {
      this.$emit('addfeature', element)
    })
  })

  const removes = obsFromOlEvent(this.$featuresCollection, 'remove')
  this.subscribeTo(removes, ({ element }) => {
    const elementUid = getObjectUid(element)
    if (this._featureSubs[elementUid]) {
      this.unsubscribe(this._featureSubs[elementUid])
      delete this._featureSubs[elementUid]
    }

    ++this.rev

    this.$nextTick(() => {
      this.$emit('removefeature', element)
    })
  })
}
