import debounce from 'debounce-promise'
import { Collection, Feature, getUid } from 'ol'
import CollectionEventType from 'ol/CollectionEventType'
import EventType from 'ol/events/EventType'
import ObjectEventType from 'ol/ObjectEventType'
import { from as fromObs, merge as mergeObs } from 'rxjs'
import { debounceTime, map as mapObs, mergeMap, tap } from 'rxjs/operators'
import { getFeatureId } from '../ol-ext'
import { bufferDebounceTime, fromOlEvent as obsFromOlEvent } from '../rx-ext'
import { instanceOf } from '../util/assert'
import { clonePlainObject, forEach, isEqual, isFunction, map, find } from '../util/minilo'
import featureHelper from './feature-helper'
import identMap from './ident-map'
import { FRAME_TIME } from './ol-cmp'
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
    featureHelper,
  ],
  computed: {
    /**
     * @type {Object[]}
     */
    currentFeaturesDataProj () {
      if (!this.rev) return []

      return map(this.getFeatures(), feature => this.writeFeatureInDataProj(feature))
    },
    /**
     * @type {Object[]}
     */
    currentFeaturesViewProj () {
      if (!this.rev) return []

      return map(this.getFeatures(), feature => this.writeFeatureInViewProj(feature))
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
    currentFeaturesDataProj: {
      deep: true,
      handler: /*#__PURE__*/debounce(async function (value, prev) {
        if (isEqual(value, prev)) return
        console.log('update event', value.slice(), prev.slice())
        this.$emit('update:features', clonePlainObject(value))
      }, FRAME_TIME),
    },
    async resolvedDataProjection () {
      await this.addFeatures(this.currentFeaturesDataProj)
    },
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
     * @returns {{readonly featuresContainer: Object}}
     * @protected
     */
    getServices () {
      const vm = this

      return {
        get featuresContainer () { return vm },
      }
    },
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
      feature = await this.initializeFeature(feature)
      instanceOf(feature, Feature)
      // todo add hash {featureId => featureIdx, ....}
      const foundFeature = this.getFeatureById(getFeatureId(feature))
      if (foundFeature == null) {
        this.$featuresCollection.push(feature)
      } else {
        this.updateFeature(foundFeature, feature)
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
      return find(this.getFeatures(), feature => {
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
  const vm = this
  const adds = obsFromOlEvent(this.$featuresCollection, CollectionEventType.ADD).pipe(
    mergeMap(({ type, element }) => fromObs(this.initializeFeature(element)).pipe(
      mapObs(element => ({ type, element })),
    )),
    tap(({ type, element }) => {
      const uid = getUid(element)
      const propChanges = obsFromOlEvent(element, ObjectEventType.PROPERTYCHANGE)
      const changes = obsFromOlEvent(element, EventType.CHANGE)
      const events = mergeObs(
        propChanges,
        changes,
      ).pipe(
        debounceTime(FRAME_TIME),
      )
      this._featureSubs[uid] = this.subscribeTo(events, () => {
        ++this.rev
      })
    }),
  )
  const removes = obsFromOlEvent(this.$featuresCollection, CollectionEventType.REMOVE).pipe(
    tap(({ type, element }) => {
      const uid = getUid(element)
      if (this._featureSubs[uid]) {
        this.unsubscribe(this._featureSubs[uid])
        delete this._featureSubs[uid]
      }
    }),
  )
  const events = mergeObs(adds, removes).pipe(
    mapObs(({ type, element }) => ({
      type,
      feature: element,
      get json () {
        if (!this._json) {
          this._json = vm.writeFeatureInDataProj(this.feature)
        }
        return this._json
      },
    })),
    bufferDebounceTime(FRAME_TIME),
  )
  this.subscribeTo(events, events => {
    ++this.rev

    this.$nextTick(() => {
      forEach(events, evt => {
        this.$emit(evt.type + 'feature', evt)
        // todo remove in v0.13.x
        this.$emit(evt.type + ':feature', evt.feature)
      })
    })
  })
}
