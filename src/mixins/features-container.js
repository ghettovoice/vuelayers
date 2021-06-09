import { Collection } from 'ol'
import CollectionEventType from 'ol/CollectionEventType'
import EventType from 'ol/events/EventType'
import ObjectEventType from 'ol/ObjectEventType'
import { getUid } from 'ol/util'
import { merge as mergeObs } from 'rxjs'
import { distinctUntilChanged, map as mapObs, tap } from 'rxjs/operators'
import { COORD_PRECISION, getFeatureId, roundExtent, roundPointCoords, writeGeoJsonFeature } from '../ol-ext'
import { bufferDebounceTime, fromOlEvent as obsFromOlEvent } from '../rx-ext'
import { find, forEach, identity, isEqual } from '../utils'
import featureHelper from './feature-helper'
import identMap from './ident-map'
import { FRAME_TIME, makeChangeOrRecreateWatchers } from './ol-cmp'
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
     * @returns {string|undefined}
     */
    featuresCollectionIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'features_collection')
    },
  },
  watch: {
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'featuresCollectionIdent',
    ]),
  },
  created () {
    /**
     * @type {module:ol/Collection~Collection<module:ol/Feature~Feature>}
     * @private
     */
    this._featuresCollection = this.instanceFactoryCall(this.featuresCollectionIdent, () => new Collection())
    this._featureSubs = {}

    this::defineServices()
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
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToCollectionEvents()
    },
    /**
     * @param {FeatureLike[]|module:ol/Collection~Collection<FeatureLike>} features
     * @param {boolean} [viewProj=false]
     */
    addFeatures (features, viewProj = false) {
      forEach(features, feature => this.addFeature(feature, viewProj))
    },
    /**
     * @param {FeatureLike} feature
     * @param {boolean} [viewProj=false]
     */
    addFeature (feature, viewProj = false) {
      feature = this.initializeFeature(feature, viewProj)
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
     */
    removeFeatures (features) {
      forEach(features, ::this.removeFeature)
    },
    /**
     * @param {FeatureLike} feature
     */
    removeFeature (feature) {
      feature = this.getFeatureById(getFeatureId(feature?.$feature || feature))
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
      return find(this.getFeatures(), feature => getFeatureId(feature) === featureId)
    },
    /**
     * @return {Array<module:ol/Feature~Feature>}
     */
    getFeatures () {
      return this.$featuresCollection.getArray().slice()
    },
    /**
     * @return {module:ol/Collection~Collection<module:ol/Feature~Feature>}
     */
    getFeaturesCollection () {
      return this._featuresCollection
    },
    /**
     * @param {function} callback
     * @return {*}
     */
    forEachFeature (callback) {
      let res
      this.$featuresCollection.forEach((...args) => {
        res = callback(...args)
      })

      return res
    },
    /**
     * @param {number[]} extent
     * @param {function} callback
     * @param {boolean} [viewProj=false]
     * @returns {*}
     */
    forEachFeatureInExtent (extent, callback, viewProj = false) {
      extent = viewProj ? roundExtent(extent) : this.extentToViewProj(extent)

      return this.forEachFeature(feature => {
        const geometry = feature.getGeometry()
        if (geometry && geometry.intersectsExtent(extent)) {
          const result = callback(feature)
          if (result) {
            return result
          }
        }
      })
    },
    /**
     * @param {number[]} extent
     * @param {function} callback
     * @param {boolean} [viewProj=false]
     * @returns {*}
     */
    forEachFeatureIntersectingExtent (extent, callback, viewProj = false) {
      return this.forEachFeatureInExtent(extent, callback, viewProj)
    },
    /**
     * @param {number[]} coordinate
     * @param {boolean} [viewProj=false]
     * @returns {Array<module:ol/Feature~Feature>}
     */
    getFeaturesAtCoordinate (coordinate, viewProj = false) {
      return this.getFeaturesInExtent([coordinate[0], coordinate[1], coordinate[0], coordinate[1]], viewProj)
    },
    /**
     * @param {number[]} extent
     * @param {boolean} [viewProj=false]
     * @returns {Array<module:ol/Feature~Feature>}
     */
    getFeaturesInExtent (extent, viewProj = false) {
      const features = []
      this.forEachFeatureIntersectingExtent(extent, feature => {
        features.push(feature)
      }, viewProj)

      return features
    },
    /**
     * @param {number[]} coordinate
     * @param {function} [filter]
     * @param {boolean} [viewProj=false]
     * @returns {module:ol/Feature~Feature}
     */
    getClosestFeatureToCoordinate (coordinate, filter = identity, viewProj = false) {
      coordinate = viewProj ? roundPointCoords(coordinate) : this.pointToViewProj(coordinate)

      let closestFeature
      let minSquaredDistance = Infinity
      this.forEachFeature(feature => {
        if (!filter(feature)) return

        const geometry = feature.getGeometry()
        if (!geometry) return

        const closestPoint = geometry.getClosestPoint(coordinate)
        const prevSquaredDistance = minSquaredDistance
        minSquaredDistance = Math.pow(closestPoint[0] - coordinate[0], 2) + Math.pow(closestPoint[1] - coordinate[1])
        if (minSquaredDistance < prevSquaredDistance) {
          closestFeature = feature
        }
      })

      return closestFeature
    },
    /**
     * @param {boolean} [viewProj=false]
     * @returns {number[]}
     */
    getFeaturesExtent (viewProj = false) {
      let extent
      this.forEachFeature(feature => {
        const geometry = feature.getGeometry()
        if (!geometry) return

        const geomExtent = geometry.getExtent()
        if (!extent) {
          extent = geomExtent
        } else {
          extent = [
            geomExtent[0] < extent[0] ? geomExtent[0] : extent[0],
            geomExtent[1] < extent[1] ? geomExtent[1] : extent[1],
            geomExtent[2] > extent[2] ? geomExtent[2] : extent[2],
            geomExtent[3] > extent[3] ? geomExtent[3] : extent[3],
          ]
        }
      })

      return viewProj ? extent : this.extentToDataProj(extent)
    },
    /**
     * @param {string|undefined} value
     * @param {string|undefined} prevValue
     * @protected
     */
    featuresCollectionIdentChanged (value, prevValue) {
      if (value && prevValue) {
        this.moveInstance(value, prevValue)
      } else if (value && !prevValue && this.$featuresCollection) {
        this.setInstance(value, this.$featuresCollection)
      } else if (!value && prevValue) {
        this.unsetInstance(prevValue)
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
  const adds = obsFromOlEvent(this.$featuresCollection, CollectionEventType.ADD).pipe(
    mapObs(evt => ({
      ...evt,
      element: this.initializeFeature(evt.element),
    })),
    tap(({ element }) => {
      const uid = getUid(element)
      const propChanges = obsFromOlEvent(element, ObjectEventType.PROPERTYCHANGE)
      const changes = obsFromOlEvent(element, EventType.CHANGE)
      const events = mergeObs(propChanges, changes).pipe(
        distinctUntilChanged(isEqual),
      )
      this._featureSubs[uid] = this.subscribeTo(events, ::this.debounceChanged)
    }),
  )
  const removes = obsFromOlEvent(this.$featuresCollection, CollectionEventType.REMOVE).pipe(
    tap(({ element }) => {
      const uid = getUid(element)
      if (this._featureSubs[uid]) {
        this.unsubscribe(this._featureSubs[uid])
        delete this._featureSubs[uid]
      }
    }),
  )
  const events = mergeObs(adds, removes).pipe(
    mapObs(({ type, element }) => {
      const viewProj = this.resolvedViewProjection
      const dataProj = this.resolvedDataProjection
      return {
        type,
        feature: element,
        get json () {
          if (!this._json) {
            this._json = writeGeoJsonFeature(this.feature, viewProj, dataProj, COORD_PRECISION)
          }
          return this._json
        },
      }
    }),
    bufferDebounceTime(FRAME_TIME),
  )
  this.subscribeTo(events, async events => {
    await this.debounceChanged()
    forEach(events, evt => {
      this.$emit(evt.type + 'feature', evt)
      // todo remove in v0.13.x
      this.$emit(evt.type + ':feature', evt.feature)
    })
  })
}
