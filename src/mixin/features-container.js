import { Collection, Feature } from 'ol'
import { merge as mergeObs } from 'rxjs/observable'
import { debounceTime } from 'rxjs/operators'
import Vue from 'vue'
import { getFeatureId, getObjectUid, initializeFeature, mergeFeatures } from '../ol-ext'
import { obsFromOlEvent } from '../rx-ext'
import { instanceOf } from '../util/assert'
import { isPlainObject, map } from '../util/minilo'
import projTransforms from './proj-transforms'
import rxSubs from './rx-subs'

export default {
  mixins: [rxSubs, projTransforms],
  computed: {
    featureIds () {
      if (!this.rev) return []

      return this.getFeatures().map(getFeatureId)
    },
    featuresViewProj () {
      if (!this.rev) return []

      return this.getFeatures().map(::this.writeFeatureInViewProj)
    },
    featuresDataProj () {
      if (!this.rev) return []

      return this.getFeatures().map(::this.writeFeatureInDataProj)
    },
  },
  methods: {
    /**
     * @param {Array<(Feature|Vue|Object)>} features
     * @return {Promise<void>}
     */
    addFeatures (features) {
      return Promise.all(map(features, ::this.addFeature))
    },
    /**
     * @param {Feature|Vue|Object} feature
     * @return {Promise<void>}
     */
    async addFeature (feature) {
      if (feature instanceof Vue) {
        feature = await feature.resolveOlObject()
      } else if (isPlainObject(feature)) {
        feature = this.readFeatureInDataProj(feature)
      }

      instanceOf(feature, Feature)
      initializeFeature(feature)

      const foundFeature = this.getFeatureById(getFeatureId(feature))
      if (foundFeature == null) {
        this.$featuresCollection.push(feature)
      } else {
        mergeFeatures(foundFeature, feature)
      }
    },
    /**
     * @param {Array<(Feature|Vue|Object)>} features
     * @return {Promise<void>}
     */
    removeFeatures (features) {
      return Promise.all(map(features, ::this.removeFeature))
    },
    /**
     * @param {Feature|Vue|Object} feature
     * @return {Promise<void>}
     */
    async removeFeature (feature) {
      if (feature instanceof Vue) {
        feature = await feature.resolveOlObject()
      }

      feature = this.getFeatureById(getFeatureId(feature))
      if (!feature) return

      initializeFeature(feature)
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
     * @return {Feature|undefined}
     */
    getFeatureById (featureId) {
      // todo add hash {featureId => featureIdx, ....}
      return this.$featuresCollection.getArray().find(feature => {
        return getFeatureId(feature) === featureId
      })
    },
    /**
     * @return {Feature[]}
     */
    getFeatures () {
      return this.$featuresCollection.getArray()
    },
    /**
     * @return {Collection<Feature>>}
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
     * @type {Collection<Feature>>}
     * @private
     */
    this._featuresCollection = new Collection()
    this._featureSubs = {}

    this::defineServices()
    this::subscribeToCollectionEvents()
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
      this.$emit('add:feature', element)
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
      this.$emit('remove:feature', element)
    })
  })
}
