import debounce from 'debounce-promise'
import { Feature } from 'ol'
import { all as loadAll } from 'ol/loadingstrategy'
import { get as getProj } from 'ol/proj'
import VectorEventType from 'ol/source/VectorEventType'
import { from as fromObs, merge as mergeObs } from 'rxjs'
import { map as mapObs, mergeMap } from 'rxjs/operators'
import {
  EPSG_4326,
  getFeatureId,
  getGeoJsonFmt,
  initializeFeature,
  isGeoJSONFeature,
  transform,
  transforms,
} from '../ol-ext'
import { bufferDebounceTime, fromOlEvent as obsFromOlEvent } from '../rx-ext'
import {
  and,
  clonePlainObject,
  constant,
  difference,
  every,
  forEach,
  instanceOf,
  isArray,
  isEmpty,
  isEqual,
  isFunction,
  isString,
  makeWatchers,
  map,
  mergeDescriptors,
  negate,
  pick,
  sealFactory,
  stubArray,
} from '../utils'
import featureHelper from './feature-helper'
import { FRAME_TIME } from './ol-cmp'
import source from './source'

const isNotEmptyString = /*#__PURE__*/and(isString, negate(isEmpty))

/**
 * Basic vector source mixin.
 */
export default {
  mixins: [
    featureHelper,
    source,
  ],
  stubVNode: {
    empty: false,
    attrs () {
      return {
        id: this.vmId,
        class: this.vmClass,
      }
    },
  },
  props: {
    // ol/source/Vector
    /**
     * @type {Object[]}
     */
    features: {
      type: Array,
      default: stubArray,
      validator: value => every(value, isGeoJSONFeature),
    },
    /**
     * Source format factory
     * @type {function} formatFactory
     */
    formatFactory: {
      type: Function,
      default: getGeoJsonFmt,
    },
    /**
     * Feature loader.
     * Feature loader should load features from some remote service, decode them and pas to `features` prop to render.
     * @type {module:ol/featureloader~FeatureLoader|undefined} loader
     */
    loader: Function,
    /**
     * @deprecated Use `loader` prop instead
     * @todo remove in v0.13.x
     */
    loaderFactory: Function,
    /**
     * Loading strategy factory.
     * Extent here in map view projection.
     * @type {function} strategyFactory
     */
    loadingStrategy: {
      type: Function,
      // default: loadAll,
    },
    /**
     * @deprecated Use `loadingStrategy` prop instead
     * @todo remove in v0.13.x
     */
    strategyFactory: Function,
    /**
     * String or url factory
     * @type {string|function} url
     */
    url: {
      type: [String, Function],
      validator: value => isFunction(value) || isNotEmptyString(value),
    },
    /**
     * @type {boolean}
     */
    overlaps: {
      type: Boolean,
      default: true,
    },
    /**
     * @type {boolean}
     */
    useSpatialIndex: {
      type: Boolean,
      default: true,
    },
    projection: {
      type: String,
      default: EPSG_4326,
      validator: value => getProj(value) != null,
    },
  },
  data () {
    return {
      /**
       * @returns {module:ol/format/Feature~FeatureFormat|null}
       */
      format: null,
    }
  },
  computed: {
    featuresDataProj () {
      return map(this.features, feature => initializeFeature(clonePlainObject(feature)))
    },
    featuresViewProj () {
      return map(this.featuresDataProj, feature => ({
        ...feature,
        geometry: {
          ...feature.geometry,
          coordinates: transforms[feature.geometry.type].transform(
            feature.geometry.coordinates,
            this.resolvedDataProjection,
            this.resolvedViewProjection,
          ),
        },
      }))
    },
    currentFeaturesDataProj () {
      if (!(this.rev && this.$source)) return []

      return map(this.getFeaturesInternal(), feature => this.writeFeatureInDataProj(feature))
    },
    currentFeaturesViewProj () {
      if (!(this.rev && this.$source)) return []

      return map(this.getFeaturesInternal(), feature => this.writeFeatureInViewProj(feature))
    },
    currentExtentDataProj () {
      if (!(this.rev && this.$source)) return

      return this.getExtentInternal()
    },
    currentExtentViewProj () {
      if (!(this.rev && this.$source)) return

      return this.getExtentInternal(null, true)
    },
    urlFunc () {
      return this.createUrlFunc(this.url)
    },
    loaderFunc () {
      let loader = this.loader
      if (!loader && this.loaderFactory) {
        loader = this.loaderFactory()
      }

      return this.createLoaderFunc(loader)
    },
    formatIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'format')
    },
    sealFormatFactory () {
      return sealFactory(::this.formatFactory)
    },
    loadingStrategyFunc () {
      let loadingStrategy = this.loadingStrategy
      if (!loadingStrategy && this.strategyFactory) {
        loadingStrategy = this.strategyFactory()
      }

      return loadingStrategy || loadAll
    },
  },
  watch: {
    featuresViewProj: {
      deep: true,
      handler: async function (features) {
        if (isEqual(features, this.currentFeaturesViewProj)) return
        // add new features
        await this.addFeatures(features, true)
        // remove non-matched features
        await this.removeFeatures(difference(
          this.currentFeaturesViewProj,
          features,
          (a, b) => getFeatureId(a) === getFeatureId(b),
        ))
      },
    },
    currentFeaturesDataProj: {
      deep: true,
      handler: /*#__PURE__*/debounce(function (value) {
        if (isEqual(value, this.featuresDataProj)) return

        this.$emit('update:features', clonePlainObject(value))
      }, FRAME_TIME),
    },
    async urlFunc (value) {
      await this.setUrlInternal(value)
    },
    async loaderFunc (value) {
      await this.setLoaderInternal(value)
    },
    formatIdent (value, prevValue) {
      if (value && prevValue) {
        this.moveInstance(value, prevValue)
      } else if (value && !prevValue && this.format) {
        this.setInstance(value, this.format)
      } else if (!value && prevValue) {
        this.unsetInstance(prevValue)
      }
    },
    async sealFormatFactory (value) {
      while (this.hasInstance(this.formatIdent)) {
        this.unsetInstance(this.formatIdent)
      }

      if (isFunction(value)) {
        this.format = this.instanceFactoryCall(this.formatIdent, this::value)
      } else {
        this.format = undefined
      }

      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log('sealDataFormatFactory changed, scheduling recreate...')
      }

      await this.scheduleRecreate()
    },
    async overlaps (value) {
      if (value === await this.getOverlaps()) return

      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log('overlaps changed, scheduling recreate...')
      }

      await this.scheduleRecreate()
    },
    .../*#__PURE__*/makeWatchers([
      'loadingStrategyFunc',
      'useSpatialIndex',
    ], prop => async function (val, prev) {
      if (isEqual(val, prev)) return

      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log(`${prop} changed, scheduling recreate...`)
      }

      await this.scheduleRecreate()
    }),
  },
  created () {
    if (process.env.NODE_ENV !== 'production') {
      if (this.loaderFactory) {
        this.$logger.warn("'loaderFactory' prop is deprecated. Use 'loader' prop instead.")
      }
      if (this.strategyFactory) {
        this.$logger.warn("'strategyFactory' prop is deprecated. Use 'loadingStrategy' prop instead.")
      }
    }

    if (isFunction(this.sealFormatFactory)) {
      this.format = this.instanceFactoryCall(this.formatIdent, ::this.sealFormatFactory)
      // this.$watch('format', async () => {
      //   if (process.env.VUELAYERS_DEBUG) {
      //     this.$logger.log('format changed, scheduling recreate...')
      //   }
      //
      //   await this.scheduleRecreate()
      // })
    }
  },
  updated () {
    if (process.env.NODE_ENV !== 'production') {
      if (this.loaderFactory) {
        this.$logger.warn("'loaderFactory' prop is deprecated. Use 'loader' prop instead.")
      }
      if (this.strategyFactory) {
        this.$logger.warn("'strategyFactory' prop is deprecated. Use 'loadingStrategy' prop instead.")
      }
    }
  },
  methods: {
    async mount () {
      await this.addFeatures(this.featuresDataProj)
      await this::source.methods.mount()
    },
    getServices () {
      const vm = this

      return mergeDescriptors(
        this::source.methods.getServices(),
        {
          get featuresContainer () { return vm },
        },
      )
    },
    subscribeAll () {
      this::source.methods.subscribeAll()
      this::subscribeToSourceEvents()
    },
    .../*#__PURE__*/pick(source.methods, [
      'beforeInit',
      'init',
      'deinit',
      'beforeMount',
      'unmount',
      'scheduleRefresh',
      'remount',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'resolveOlObject',
      'resolveSource',
    ]),
    async addFeatures (features, viewProj = false) {
      const newFeatures = []
      await Promise.all(map(features || [], async feature => {
        feature = await this.initializeFeature(feature, viewProj)
        instanceOf(feature, Feature)

        const foundFeature = await this.getFeatureById(getFeatureId(feature))
        if (foundFeature) {
          this.updateFeature(foundFeature, feature)
        } else {
          newFeatures.push(feature)
        }
      }));

      (await this.resolveSource()).addFeatures(newFeatures)
    },
    async addFeature (feature, viewProj = false) {
      await this.addFeatures([feature], viewProj)
    },
    async removeFeatures (features) {
      await Promise.all(map(features, ::this.removeFeature))
    },
    async removeFeature (feature) {
      if (isFunction(feature.resolveOlObject)) {
        feature = await feature.resolveOlObject()
      }

      feature = await this.getFeatureById(getFeatureId(feature))
      if (!feature) return

      (await this.resolveSource()).removeFeature(feature)
    },
    async getFeatureById (featureId) {
      return (await this.resolveSource()).getFeatureById(featureId)
    },
    async getFeatures () {
      await this.resolveSource()

      return this.getFeaturesInternal()
    },
    getFeaturesInternal () {
      return this.$source.getFeatures()
    },
    async getFeaturesCollection () {
      await this.resolveSource()

      return this.getFeaturesCollectionInternal()
    },
    getFeaturesCollectionInternal () {
      return this.$source.getFeaturesCollection()
    },
    async clear () {
      const source = await this.resolveSource()

      return new Promise(resolve => {
        source.once('change', () => resolve())
        source.clear()
      })
    },
    async isEmpty () {
      return (await this.resolveSource()).isEmpty()
    },
    /**
     * @param {function} callback
     * @returns {Promise<*>}
     */
    async forEachFeature (callback) {
      return (await this.resolveSource()).forEachFeature(callback)
    },
    /**
     * @param {number[]} extent
     * @param {function} callback
     * @param {boolean} [viewProj=false]
     * @returns {Promise<*>}
     */
    async forEachFeatureInExtent (extent, callback, viewProj = false) {
      if (!viewProj) {
        extent = this.extentToViewProj(extent)
      }

      return (await this.resolveSource()).forEachFeatureInExtent(extent, callback)
    },
    /**
     * @param {number[]} extent
     * @param {function} callback
     * @param {boolean} [viewProj=false]
     * @returns {Promise<*>}
     */
    async forEachFeatureIntersectingExtent (extent, callback, viewProj = false) {
      if (!viewProj) {
        extent = this.extentToViewProj(extent)
      }

      return (await this.resolveSource()).forEachFeatureIntersectingExtent(extent, callback)
    },
    /**
     * @param {number[]} coordinate
     * @param {boolean} [viewProj=false]
     * @returns {Promise<Array<module:ol/Feature~Feature>>}
     */
    async getFeaturesAtCoordinate (coordinate, viewProj = false) {
      if (!viewProj) {
        coordinate = this.pointToViewProj(coordinate)
      }

      return (await this.resolveSource()).getFeaturesAtCoordinate(coordinate)
    },
    /**
     * @param {number[]} extent
     * @param {boolean} [viewProj=false]
     * @returns {Promise<Array<module:ol/Feature~Feature>>}
     */
    async getFeaturesInExtent (extent, viewProj = false) {
      if (!viewProj) {
        extent = this.extentToViewProj(extent)
      }

      return (await this.resolveSource()).getFeaturesInExtent(extent)
    },
    /**
     * @param {number[]} coordinate
     * @param {function} [filter]
     * @param {boolean} [viewProj=false]
     * @returns {Promise<module:ol/Feature~Feature>}
     */
    async getClosestFeatureToCoordinate (coordinate, filter, viewProj = false) {
      if (!viewProj) {
        coordinate = this.pointToViewProj(coordinate)
      }

      return (await this.resolveSource()).getClosestFeatureToCoordinate(coordinate, filter)
    },
    /**
     * @param {number[]} [extent]
     * @param {boolean} [viewProj=false]
     * @returns {Promise<number[]>}
     */
    async getExtent (extent, viewProj = false) {
      await this.resolveSource()

      return this.getExtentInternal(extent, viewProj)
    },
    getExtentInternal (extent, viewProj = false) {
      if (viewProj) {
        return this.$source.getExtent(extent)
      }

      return this.extentToDataProj(this.$source.getExtent(this.extentToViewProj(extent)))
    },
    /**
     * @returns {module:ol/format/Feature~FeatureFormat|undefined}
     */
    getFormat () {
      return this.format
    },
    /**
     * @returns {Promise<boolean>}
     */
    async getOverlaps () {
      return (await this.resolveSource()).getOverlaps()
    },
    /**
     * @returns {Promise<string|function|undefined>}
     */
    async getUrl () {
      return (await this.resolveSource()).getUrl()
    },
    /**
     * @param {string|function} url
     * @returns {Promise<void>}
     */
    async setUrl (url) {
      await this.setUrlInternal(this.createUrlFunc(url))
    },
    /**
     * @param {string|function} url
     * @returns {Promise<void>}
     * @protected
     */
    async setUrlInternal (url) {
      (await this.resolveSource()).setUrl(url)
      await this.refresh()
    },
    /**
     * @param {function} loader
     * @returns {Promise<void>}
     */
    async setLoader (loader) {
      await this.setLoaderInternal(this.wrapLoaderFunc(loader))
    },
    /**
     * @param {function} loader
     * @returns {Promise<void>}
     * @protected
     */
    async setLoaderInternal (loader) {
      (await this.resolveSource()).setLoader(loader)
      await this.refresh()
    },
    /**
     * @param {number[]} extent
     * @param {boolean} [viewProj=false]
     * @returns {Promise<void>}
     */
    async removeLoadedExtent (extent, viewProj = false) {
      if (!viewProj) {
        extent = this.extentToViewProj(extent)
      }

      (await this.resolveSource()).removeLoadedExtent(extent)
    },
    /**
     * @param {string|function|undefined} url
     * @return {function|undefined}
     * @protected
     */
    createUrlFunc (url) {
      if (!url) return

      if (!isFunction(url)) {
        url = constant(url)
      }

      return this.wrapUrlFunc(url)
    },
    /**
     * @param {function} urlFunc
     * @returns {function}
     * @protected
     */
    wrapUrlFunc (urlFunc) {
      return (extent, resolution, projection) => {
        extent = transformExtent(extent, projection, this.resolvedDataProjection)
        projection = this.resolvedDataProjection

        return urlFunc(extent, resolution, projection)
      }
    },
    /**
     * @param {function|undefined} loader
     * @return {function|undefined}
     * @protected
     */
    createLoaderFunc (loader) {
      if (!isFunction(loader)) return

      return this.wrapLoaderFunc(loader)
    },
    /**
     * @param {function} loaderFunc
     * @returns {Function}
     * @protected
     */
    wrapLoaderFunc (loaderFunc) {
      return async (extent, resolution, projection) => {
        let features = await loaderFunc(
          transformExtent(extent, projection, this.resolvedDataProjection),
          resolution,
          this.resolvedDataProjection,
        )
        if (!(isArray(features) && features[0] instanceof Feature)) {
          features = this.readSource(features)
        }
        if (isArray(features)) {
          await this.addFeatures(features)
        }
      }
    },
    /**
     * @param {*} data
     * @returns {Array<module:ol/Feature~Feature>}
     */
    readSource (data) {
      return this.format.readFeatures(data, {
        featureProjection: this.resolvedViewProjection,
        dataProjection: this.resolvedDataProjection,
      })
    },
  },
}

function subscribeToSourceEvents () {
  const vm = this
  const adds = obsFromOlEvent(this.$source, VectorEventType.ADDFEATURE).pipe(
    mergeMap(({ type, feature }) => fromObs(this.initializeFeature(feature)).pipe(
      mapObs(feature => ({ type, feature, oldType: 'add:feature' })),
    )),
  )
  const removes = obsFromOlEvent(this.$source, VectorEventType.REMOVEFEATURE).pipe(
    mapObs(evt => ({ ...evt, oldType: 'remove:feature' })),
  )
  const events = mergeObs(adds, removes).pipe(
    mapObs(({ type, feature, oldType }) => ({
      type,
      feature,
      oldType,
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
    this.$nextTick(() => {
      forEach(events, evt => {
        const oldType = evt.oldType
        delete evt.oldType

        this.$emit(evt.type, evt)
        // todo remove in v0.13.x
        this.$emit(oldType, evt.feature)
      })
    })
  })
}

function transformExtent (extent, sourceProj, destProj) {
  extent = extent.slice()
  if (isFinite(extent[0]) && isFinite(extent[1])) {
    [extent[0], extent[1]] = transform([extent[0], extent[1]], sourceProj, destProj)
  }
  if (isFinite(extent[2]) && isFinite(extent[3])) {
    [extent[2], extent[3]] = transform([extent[2], extent[3]], sourceProj, destProj)
  }
  return extent
}
