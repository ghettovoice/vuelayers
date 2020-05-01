import debounce from 'debounce-promise'
import { Feature } from 'ol'
import { all as loadAll } from 'ol/loadingstrategy'
import { createGeoJsonFmt, getFeatureId, isGeoJSONFeature, transform } from '../ol-ext'
import {
  and,
  clonePlainObject,
  constant,
  difference,
  isArray,
  isEmpty,
  isEqual,
  isFunction,
  isString,
  negate,
  pick,
  sealFactory,
  stubArray,
} from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import { makeWatchers } from '../util/vue-helpers'
import featuresContainer from './features-container'
import projTransforms from './proj-transforms'
import source from './source'

const isNotEmptyString = and(isString, negate(isEmpty))

/**
 * Basic vector source mixin.
 */
export default {
  mixins: [
    projTransforms,
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
      validator: value => value.every(isGeoJSONFeature),
    },
    /**
     * Source format factory
     * @type {function} formatFactory
     */
    formatFactory: {
      type: Function,
      default: createGeoJsonFmt,
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
      default: loadAll,
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
    }
  },
  computed: {
    /**
     * @returns {function|undefined}
     */
    urlFunc () {
      return this.createUrlFunc(this.url)
    },
    /**
     * @type {function|undefined}
     */
    loaderFunc () {
      let loader = this.loader
      if (!loader && this.loaderFactory) {
        loader = this.loaderFactory()
      }

      return this.createLoaderFunc(loader)
    },
    /**
     * @returns {string|undefined}
     */
    formatIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'format')
    },
    /**
     * @returns {function}
     */
    sealFormatFactory () {
      return sealFactory(::this.formatFactory)
    },
    /**
     * @returns {function}
     */
    loadingStrategyFunc () {
      let loadingStrategy = this.loadingStrategy
      if (this.strategyFactory) {
        loadingStrategy = this.strategyFactory()
      }

      return loadingStrategy
    },
  },
  watch: {
    features: {
      deep: true,
      async handler (features) {
        if (!this.$source || isEqual(features, this.featuresDataProj)) return
        // add new features
        await Promise.all(features.map(feature => this.addFeature({ ...feature })))
        // remove non-matched features
        await Promise.all(difference(
          this.getFeatures(),
          features,
          (a, b) => getFeatureId(a) === getFeatureId(b),
        ).map(::this.removeFeature))
      },
    },
    featuresDataProj: {
      deep: true,
      handler: debounce(function (features) {
        this.$emit('update:features', clonePlainObject(features))
      }, 1000 / 60),
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
    ...makeWatchers([
      'loadingStrategyFunc',
      'overlaps',
      'useSpatialIndex',
    ], prop => async function () {
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
    /**
     * @param {function} callback
     * @returns {Promise<void>}
     */
    async forEachFeature (callback) {
      (await this.resolveSource()).forEachFeature(callback)
    },
    /**
     * @param {number[]} extent
     * @param {function} callback
     * @returns {Promise<*|T>}
     */
    async forEachFeatureInExtent (extent, callback) {
      extent = this.extentToViewProj(extent)

      return (await this.resolveSource()).forEachFeatureInExtent(extent, callback)
    },
    /**
     * @param {number[]} extent
     * @param {function} callback
     * @returns {Promise<T>}
     */
    async forEachFeatureIntersectingExtent (extent, callback) {
      extent = this.extentToViewProj(extent)

      return (await this.resolveSource()).forEachFeatureInExtent(extent, callback)
    },
    /**
     * @param {number[]} coordinate
     * @returns {Promise<Array<module:ol/Feature~Feature>>}
     */
    async getFeaturesAtCoordinate (coordinate) {
      coordinate = this.pointToViewProj(coordinate)

      return (await this.resolveSource()).getFeaturesAtCoordinate(coordinate)
    },
    /**
     * @param {number[]} extent
     * @returns {Promise<Array<module:ol/Feature~Feature>>}
     */
    async getFeaturesInExtent (extent) {
      extent = this.extentToViewProj(extent)

      return (await this.resolveSource()).getFeaturesInExtent(extent)
    },
    /**
     * @param {number[]} coordinate
     * @param {function} [filter]
     * @returns {Promise<module:ol/Feature~Feature>}
     */
    async getClosestFeatureToCoordinate (coordinate, filter) {
      coordinate = this.pointToViewProj(coordinate)

      return (await this.resolveSource()).getClosestFeatureToCoordinate(coordinate, filter)
    },
    /**
     * @param {number[]} [extent]
     * @returns {Promise<number[]>}
     */
    async getExtent (extent) {
      extent = this.extentToViewProj(extent)

      return (await this.resolveSource()).getExtent(extent)
    },
    /**
     * @returns {Promise<module:ol/format/Feature~FeatureFormat|undefined>}
     */
    async getFormat () {
      return (await this.resolveSource()).getFormat()
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
      await this.reload()
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
      await this.reload()
    },
    /**
     * @param {number[]} extent
     * @returns {Promise<void>}
     */
    async removeLoadedExtent (extent) {
      (await this.resolveSource()).removeLoadedExtent(this.extentToViewProj(extent))
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
        featureProjection: this.viewProjection,
        dataProjection: this.resolvedDataProjection,
      })
    },
    /**
     * @returns {Promise<void>}
     * @protected
     */
    async init () {
      await this::source.methods.init()
      await this.addFeatures(this.features)
    },
    /**
     * @return {Object}
     * @protected
     */
    getServices () {
      return mergeDescriptors(
        this::source.methods.getServices(),
        this::featuresContainer.methods.getServices(),
      )
    },
    ...pick(source.methods, [
      'deinit',
      'mount',
      'unmount',
      'refresh',
      'scheduleRefresh',
      'remount',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'subscribeAll',
      'resolveOlObject',
      'resolveSource',
    ]),
  },
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
