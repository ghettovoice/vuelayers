import { Feature, getUid } from 'ol'
import { all as loadAll } from 'ol/loadingstrategy'
import { Vector as VectorSource } from 'ol/source'
import {
  getFeatureId,
  getGeoJsonFmt,
  initializeFeature,
  isGeoJSONFeature,
  roundExtent,
  roundPointCoords,
  transform,
} from '../ol-ext'
import {
  and,
  clonePlainObject,
  coalesce,
  constant,
  difference,
  every,
  forEach,
  identity,
  instanceOf,
  isArray,
  isEmpty,
  isEqual,
  isFunction,
  isString,
  map,
  mergeDescriptors,
  negate,
  noop,
  sealFactory,
  stubArray,
} from '../utils'
import featureHelper from './feature-helper'
import featuresContainer from './features-container'
import { makeChangeOrRecreateWatchers } from './ol-cmp'
import source from './source'

const isNotEmptyString = /*#__PURE__*/and(isString, negate(isEmpty))

/**
 * Basic vector source mixin.
 */
export default {
  mixins: [
    featureHelper,
    featuresContainer,
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
  },
  data () {
    return {
      /**
       * @returns {module:ol/format/Feature~FeatureFormat|undefined}
       */
      format: undefined,
      currentUrl: undefined,
      currentLoader: undefined,
    }
  },
  computed: {
    featuresDataProj () {
      return map(this.features, feature => initializeFeature(clonePlainObject(feature)))
    },
    featuresViewProj () {
      return map(this.features, feature => initializeFeature(this.writeFeatureInViewProj(this.readFeatureInDataProj(feature))))
    },
    currentFeaturesDataProj () {
      if (!this.rev) return []

      return map(this.getFeatures(), feature => this.writeFeatureInDataProj(feature))
    },
    currentFeaturesViewProj () {
      if (!this.rev) return []

      return map(this.getFeatures(), feature => this.writeFeatureInViewProj(feature))
    },
    extentDataProj () {
      return this.rev ? this.getExtent() : undefined
    },
    extentViewProj () {
      return this.rev ? this.getExtent(true) : undefined
    },
    inputUrl () {
      return this.createUrlFunc(this.url)
    },
    inputLoader () {
      let loader = this.loader
      if (!loader && this.loaderFactory) {
        loader = this.loaderFactory()
      }

      return this.createLoaderFunc(loader)
    },
    inputLoadingStrategy () {
      let loadingStrategy = this.loadingStrategy
      if (!loadingStrategy && this.strategyFactory) {
        loadingStrategy = this.strategyFactory()
      }

      return loadingStrategy || loadAll
    },
    formatIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'format')
    },
    inputFormatFactory () {
      return sealFactory(::this.formatFactory)
    },
  },
  watch: {
    rev () {
      if (!this.$source) return

      if (this.currentUrl !== this.$source.getUrl()) {
        this.currentUrl = this.$source.getUrl()
      }
    },
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'featuresViewProj',
      'currentFeaturesDataProj',
      'extentDataProj',
      'inputUrl',
      'currentUrl',
      'inputLoader',
      'currentLoader',
      'inputLoadingStrategy',
      'inputFormatFactory',
      'formatIdent',
      'format',
      'overlaps',
      'useSpatialIndex',
    ], [
      'featuresViewProj',
      'currentFeaturesDataProj',
      'extentDataProj',
    ]),
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

    if (isFunction(this.inputFormatFactory)) {
      this.format = this.instanceFactoryCall(this.formatIdent, ::this.inputFormatFactory)
    }
    this.currentUrl = this.inputUrl
    this.currentLoader = this.inputLoader
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
    /**
     * @return {module:ol/source/Vector~VectorSource}
     * @protected
     */
    createSource () {
      return new VectorSource({
        // ol/source/Source
        attributions: this.currentAttributions,
        projection: this.resolvedDataProjection,
        wrapX: this.wrapX,
        // ol/source/Vector
        format: this.format,
        loader: this.currentLoader,
        strategy: this.inputLoadingStrategy,
        url: this.currentUrl,
        overlaps: this.overlaps,
        useSpatialIndex: this.useSpatialIndex,
        features: this.$featuresCollection,
      })
    },
    /**
     * @return {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(
        this::source.methods.getServices(),
        {
          get featuresContainer () { return vm },
        },
      )
    },
    /**
     * @protected
     */
    subscribeAll () {
      this::source.methods.subscribeAll()
      this::featuresContainer.methods.subscribeAll()
      this::subscribeToSourceEvents()
    },
    /**
     * @param {FeatureLike[]|module:ol/Collection~Collection<FeatureLike>} features
     * @param {boolean} [viewProj=false]
     */
    addFeatures (features, viewProj = false) {
      if (!this.$source) {
        return this::featuresContainer.methods.addFeatures(features, viewProj)
      }

      const newFeatures = []
      forEach(features || [], feature => {
        feature = this.initializeFeature(feature, viewProj)
        instanceOf(feature, Feature)

        const foundFeature = this.$source.getFeatureById(getFeatureId(feature))
        if (foundFeature) {
          this.updateFeature(foundFeature, feature)
        } else {
          newFeatures.push(feature)
        }
      })

      if (!newFeatures.length) return

      this.$source.addFeatures(newFeatures)
    },
    /**
     * @param {FeatureLike} feature
     * @param {boolean} [viewProj=false]
     */
    addFeature (feature, viewProj = false) {
      if (!this.$source) {
        return this::featuresContainer.methods.addFeature(feature, viewProj)
      }

      feature = this.initializeFeature(feature, viewProj)
      const foundFeature = this.$source.getFeatureById(getFeatureId(feature))
      if (foundFeature == null) {
        this.$source.addFeature(feature)
      } else {
        this.updateFeature(foundFeature, feature)
      }
    },
    /**
     * @param {FeatureLike[]|module:ol/Collection~Collection<FeatureLike>} features
     */
    removeFeatures (features) {
      if (!this.$source) {
        return this::featuresContainer.methods.removeFeatures(features)
      }

      let changed = false
      forEach(features, feature => {
        feature = this.getFeatureById(getFeatureId(feature))
        if (!feature) return
        const featureKey = getUid(feature)
        if (featureKey in this.$source.nullGeometryFeatures_) {
          delete this.$source.nullGeometryFeatures_[featureKey]
        } else {
          if (this.$source.featuresRtree_) {
            this.$source.featuresRtree_.remove(feature)
          }
        }
        this.$source.removeFeatureInternal(feature)
        changed = true
      })

      if (!changed) return

      this.$source.changed()
    },
    /**
     * @param {FeatureLike} feature
     */
    removeFeature (feature) {
      if (!this.$source) {
        return this::featuresContainer.methods.removeFeature(feature)
      }

      feature = this.$source.getFeatureById(getFeatureId(feature?.$feature || feature))
      if (!feature) return

      this.$source.removeFeature(feature)
    },
    /**
     * @param {string} featureId
     * @return {module:ol/Feature~Feature|undefined}
     */
    getFeatureById (featureId) {
      if (this.$source) {
        return this.$source.getFeatureById(featureId)
      }

      return this::featuresContainer.methods.getFeatureById(featureId)
    },
    /**
     * @return {Array<module:ol/Feature~Feature>}
     */
    getFeatures () {
      return coalesce(this.$source?.getFeatures(), this::featuresContainer.methods.getFeatures())
    },
    /**
     * @return {module:ol/Collection~Collection|undefined}
     */
    getFeaturesCollection () {
      return coalesce(this.$source?.getFeaturesCollection(), this._featuresCollection)
    },
    /**
     * @return {boolean}
     */
    isEmpty () {
      return coalesce(this.$source?.isEmpty(), this.$featuresCollection.getLength() === 0)
    },
    /**
     * @param {boolean} [fast]
     * @return {Promise<void>}
     */
    async clear (fast) {
      if (!this.$source) return this.clearFeatures()

      const source = await this.resolveSource()

      return new Promise(resolve => {
        source.once('change', () => resolve())
        source.clear()
      })
    },
    /**
     * @param {function} callback
     * @returns {*}
     */
    forEachFeature (callback) {
      if (this.$source) {
        return this.$source.forEachFeature(callback)
      }

      return this::featuresContainer.methods.forEachFeature(callback)
    },
    /**
     * @param {number[]} extent
     * @param {function} callback
     * @param {boolean} [viewProj=false]
     * @returns {*}
     */
    forEachFeatureInExtent (extent, callback, viewProj = false) {
      extent = viewProj ? roundExtent(extent) : this.extentToViewProj(extent)

      if (this.$source) {
        return this.$source.forEachFeatureInExtent(extent, callback)
      }

      return this::featuresContainer.methods.forEachFeatureInExtent(extent, callback, true)
    },
    /**
     * @param {number[]} extent
     * @param {function} callback
     * @param {boolean} [viewProj=false]
     * @returns {*}
     */
    forEachFeatureIntersectingExtent (extent, callback, viewProj = false) {
      extent = viewProj ? roundExtent(extent) : this.extentToViewProj(extent)

      if (this.$source) {
        return this.$source.forEachFeatureIntersectingExtent(extent, callback)
      }

      return this::featuresContainer.methods.forEachFeatureIntersectingExtent(extent, callback, true)
    },
    /**
     * @param {number[]} coordinate
     * @param {boolean} [viewProj=false]
     * @returns {Array<module:ol/Feature~Feature>}
     */
    getFeaturesAtCoordinate (coordinate, viewProj = false) {
      coordinate = viewProj ? roundPointCoords(coordinate) : this.pointToViewProj(coordinate)

      if (this.$source) {
        return this.$source.getFeaturesAtCoordinate(coordinate)
      }

      return this::featuresContainer.methods.getFeaturesAtCoordinate(coordinate, true)
    },
    /**
     * @param {number[]} extent
     * @param {boolean} [viewProj=false]
     * @returns {Array<module:ol/Feature~Feature>}
     */
    getFeaturesInExtent (extent, viewProj = false) {
      extent = viewProj ? roundExtent(extent) : this.extentToViewProj(extent)

      if (this.$source) {
        return this.$source.getFeaturesInExtent(extent)
      }

      return this::featuresContainer.methods.getFeaturesInExtent(extent, true)
    },
    /**
     * @param {number[]} coordinate
     * @param {function} [filter]
     * @param {boolean} [viewProj=false]
     * @returns {module:ol/Feature~Feature}
     */
    getClosestFeatureToCoordinate (coordinate, filter = identity, viewProj = false) {
      coordinate = viewProj ? roundPointCoords(coordinate) : this.pointToViewProj(coordinate)

      if (this.$source) {
        return this.$source.getClosestFeatureToCoordinate(coordinate, filter)
      }

      return this::featuresContainer.methods.getClosestFeatureToCoordinate(coordinate, filter, true)
    },
    /**
     * @param {boolean} [viewProj=false]
     * @returns {number[]}
     */
    getExtent (viewProj = false) {
      let extent
      if (this.$source) {
        extent = this.$source.getExtent()
      } else {
        extent = this::featuresContainer.methods.getFeaturesExtent(true)
      }

      return viewProj ? extent : this.extentToDataProj(extent)
    },
    /**
     * @returns {module:ol/format/Feature~FeatureFormat|undefined}
     */
    getFormat () {
      return coalesce(this.$source?.getFormat(), this.format)
    },
    /**
     * @returns {Promise<string|function|undefined>}
     */
    getUrl () {
      return coalesce(this.$source?.getUrl(), this.currentUrl)
    },
    /**
     * @param {string|function} url
     */
    setUrl (url) {
      url = this.createUrlFunc(url)

      if (url !== this.currentUrl) {
        this.currentUrl = url
      }
      if (this.$source && url !== this.$source.getUrl()) {
        this.$source.setUrl(url)
      }
    },
    /**
     * @param {function} loader
     */
    setLoader (loader) {
      loader = this.createLoaderFunc(loader)

      if (loader !== this.currentLoader) {
        this.currentLoader = loader
        this.$source?.setLoader(loader)
      }
    },
    /**
     * @param {number[]} extent
     * @param {boolean} [viewProj=false]
     */
    removeLoadedExtent (extent, viewProj = false) {
      extent = viewProj ? roundExtent(extent) : this.extentToViewProj(extent)
      this.$source?.removeLoadedExtent(extent)
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
      let fn = urlFunc

      if (!fn.wrapped) {
        fn = (extent, resolution, projection) => {
          extent = transformExtent(extent, projection, this.resolvedDataProjection)
          projection = this.resolvedDataProjection

          return urlFunc(extent, resolution, projection)
        }
        fn.wrapped = true
      }

      return fn
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
      let fn = loaderFunc

      if (!fn.wrapped) {
        fn = async (extent, resolution, projection) => {
          let features = await loaderFunc(
            transformExtent(extent, projection, this.resolvedDataProjection),
            resolution,
            this.resolvedDataProjection,
          )
          if (!(isArray(features) && features[0] instanceof Feature)) {
            features = this.readSource(features)
          }
          if (isArray(features)) {
            this.addFeatures(features)
          }
        }
        fn.wrapped = true
      }

      return fn
    },
    /**
     * @param {*} data
     * @returns {Array<module:ol/Feature~Feature>}
     */
    readSource (data) {
      return this.getFormat().readFeatures(data, {
        featureProjection: this.resolvedViewProjection,
        dataProjection: this.resolvedDataProjection,
      })
    },
    /**
     * @param {GeoJSONFeature[]} value
     * @protected
     */
    featuresViewProjChanged (value) {
      // add new features
      this.addFeatures(value, true)
      // remove non-matched features
      this.removeFeatures(difference(
        this.getFeatures(),
        value,
        (a, b) => getFeatureId(a) === getFeatureId(b),
      ))
    },
    /**
     * @param {GeoJSONFeature[]} value
     * @protected
     */
    currentFeaturesDataProjChanged (value) {
      if (isEqual(value, this.featuresDataProj)) return

      this.$emit('update:features', clonePlainObject(value))
    },
    /**
     * @param {number[]|undefined} value
     * @param {number[]|undefined} prev
     * @protected
     */
    extentDataProjChanged (value, prev) {
      if (isEqual(value, prev)) return

      this.$emit('update:extent', value?.slice())
    },
    /**
     * @param {string|function|undefined} value
     * @protected
     */
    inputUrlChanged (value) {
      this.setUrl(value)
    },
    /**
     * @param {string|function|undefined} value
     * @protected
     */
    currentUrlChanged (value) {
      if (value === this.inputUrl) return

      this.$emit('update:url', value)
    },
    /**
     * @param {function|undefined} value
     * @protected
     */
    inputLoaderChanged (value) {
      this.setLoader(value)
    },
    /**
     * @param {function|undefined} value
     * @protected
     */
    currentLoaderChanged (value) {
      if (value === this.inputLoader) return

      this.$emit('update:loader', value)
    },
    /**
     * @param {string|undefined} value
     * @param {string|undefined} prevValue
     * @protected
     */
    formatIdentChanged (value, prevValue) {
      if (value && prevValue) {
        this.moveInstance(value, prevValue)
      } else if (value && !prevValue && this.format) {
        this.setInstance(value, this.format)
      } else if (!value && prevValue) {
        this.unsetInstance(prevValue)
      }
    },
    /**
     * @param {function} value
     * @protected
     */
    inputFormatFactoryChanged (value) {
      while (this.hasInstance(this.formatIdent)) {
        this.unsetInstance(this.formatIdent)
      }

      if (isFunction(value)) {
        this.format = this.instanceFactoryCall(this.formatIdent, this::value)
      } else {
        this.format = undefined
      }
    },
    // skip not used watchers
    attributionsCollapsibleChanged: noop,
    stateChanged: noop,
  },
}

function subscribeToSourceEvents () {
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
