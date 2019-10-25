import Collection from 'ol/Collection'
import Feature from 'ol/Feature'
import Vue from 'vue'
import { merge as mergeObs } from 'rxjs/observable'
import { debounceTime } from 'rxjs/operators'
import { getFeatureId, getObjectUid, initializeFeature, mergeFeatures } from '../ol-ext'
import { instanceOf } from '../util/assert'
import { forEach, isPlainObject } from '../util/minilo'
import projTransforms from './proj-transforms'
import rxSubs from './rx-subs'
import identMap from './ident-map'
import { observableFromOlEvent } from '../rx-ext'

export default {
  mixins: [identMap, rxSubs, projTransforms],
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
    featuresCollectionIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'features_collection')
    },
  },
  methods: {
    /**
     * @param {Array<(Feature|Vue|Object)>} features
     * @return {void}
     */
    addFeatures (features) {
      forEach(features, ::this.addFeature)
    },
    /**
     * @param {Feature|Vue|Object} feature
     * @return {void}
     */
    addFeature (feature) {
      if (feature instanceof Vue) {
        feature = feature.$feature
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
     * @return {void}
     */
    removeFeatures (features) {
      forEach(features, ::this.removeFeature)
    },
    /**
     * @param {Feature|Vue|Object} feature
     * @return {void}
     */
    removeFeature (feature) {
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
    this._featuresCollection = this.instanceFactoryCall(this.featuresCollectionIdent, () => new Collection())
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
  const adds = observableFromOlEvent(this.$featuresCollection, 'add')
  this.subscribeTo(adds, ({ element }) => {
    const elementUid = getObjectUid(element)
    const propChanges = observableFromOlEvent(element, 'propertychange')
    const otherChanges = observableFromOlEvent(element, 'change')
    const featureChanges = mergeObs(propChanges, otherChanges).pipe(
      debounceTime(1000 / 60)
    )

    this._featureSubs[elementUid] = this.subscribeTo(featureChanges, () => {
      ++this.rev
    })

    ++this.rev

    this.$nextTick(() => {
      this.$emit('add:feature', element)
    })
  })

  const removes = observableFromOlEvent(this.$featuresCollection, 'remove')
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
