import debounce from 'debounce-promise'
import { all as loadAll } from 'ol/loadingstrategy'
import { createGeoJsonFmt, getFeatureId, isGeoJSONFeature, transform } from '../ol-ext'
import { constant, difference, isArray, isEmpty, isEqual, isFunction, isString, pick, stubArray } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import { makeWatchers } from '../util/vue-helpers'
import featuresContainer from './features-container'
import projTransforms from './proj-transforms'
import source from './source'

/**
 * Basic vector source mixin.
 */
export default {
  mixins: [
    source,
    featuresContainer,
    projTransforms,
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
     * Loading strategy factory.
     * Extent here in map view projection.
     * @type {function} strategyFactory
     */
    strategyFactory: {
      type: Function,
      default: () => loadAll,
    },
    /**
     * String or url factory
     * @type {string|function} url
     */
    url: {
      type: [String, Function],
      validator: value => isFunction(value) || (isString(value) && !isEmpty(value)),
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
  computed: {
    mappedFeatures () {
      return this.features.map(feature => ({
        ...feature,
        id: feature.id || null,
      }))
    },
    /**
     * @returns {function|undefined}
     */
    urlFunc () {
      return this.newUrlFunc(this.url)
    },
    /**
     * @type {function|undefined}
     */
    loaderFunc () {
      return this.newLoaderFunc(this.loader)
    },
    /**
     * @returns {function}
     */
    loadingStrategy () {
      return this.strategyFactory()
    },
    /**
     * @returns {string|undefined}
     */
    dataFormatIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'data_format')
    },
    /**
     * @returns {module:ol/format/Feature~FeatureFormat}
     */
    dataFormat () {
      return this.instanceFactoryCall(this.dataFormatIdent, () => Object.seal(this.formatFactory()))
    },
  },
  watch: {
    mappedFeatures: {
      deep: true,
      async handler (features) {
        if (!this.$source || isEqual(features, this.featuresDataProj)) return

        this.addFeatures(features)

        const forRemove = difference(
          this.featuresDataProj,
          features,
          (a, b) => getFeatureId(a) === getFeatureId(b),
        )
        await this.removeFeatures(forRemove)
      },
    },
    featuresDataProj: {
      deep: true,
      handler: debounce(function (features) {
        this.$emit('update:features', features)
      }, 1000 / 60),
    },
    async urlFunc (value) {
      this.setSourceUrlInternal(value)
    },
    async loaderFunc (value) {
      this.setSourceLoaderInternal(value)
    },
    ...makeWatchers([
      'loadingStrategy',
      'dataFormat',
      'overlaps',
      'useSpatialIndex',
    ], () => source.methods.scheduleRecreate()),
  },
  methods: {
    /**
     * @param {function} callback
     * @returns {Promise<void>}
     */
    async forEachSourceFeature (callback) {
      (await this.resolveSource()).forEachFeature(callback)
    },
    /**
     * @param {number[]} extent
     * @param {function} callback
     * @returns {Promise<*|T>}
     */
    async forEachSourceFeatureInExtent (extent, callback) {
      extent = this.extentToViewProj(extent)

      return (await this.resolveSource()).forEachFeatureInExtent(extent, callback)
    },
    /**
     * @param {number[]} extent
     * @param {function} callback
     * @returns {Promise<T>}
     */
    async forEachSourceFeatureIntersectingExtent (extent, callback) {
      extent = this.extentToViewProj(extent)

      return (await this.resolveSource()).forEachFeatureInExtent(extent, callback)
    },
    /**
     * @param {number[]} coordinate
     * @returns {Promise<Array<module:ol/Feature~Feature>>}
     */
    async getSourceFeaturesAtCoordinate (coordinate) {
      coordinate = this.pointToViewProj(coordinate)

      return (await this.resolveSource()).getFeaturesAtCoordinate(coordinate)
    },
    /**
     * @param {number[]} extent
     * @returns {Promise<Array<module:ol/Feature~Feature>>}
     */
    async getSourceFeaturesInExtent (extent) {
      extent = this.extentToViewProj(extent)

      return (await this.resolveSource()).getFeaturesInExtent(extent)
    },
    /**
     * @param {number[]} coordinate
     * @param {function} [filter]
     * @returns {Promise<module:ol/Feature~Feature>}
     */
    async getClosestSourceFeatureToCoordinate (coordinate, filter) {
      coordinate = this.pointToViewProj(coordinate)

      return (await this.resolveSource()).getClosestFeatureToCoordinate(coordinate, filter)
    },
    /**
     * @param {number[]} [extent]
     * @returns {Promise<number[]>}
     */
    async getSourceExtent (extent) {
      extent = this.extentToViewProj(extent)

      return (await this.resolveSource()).getExtent(extent)
    },
    /**
     * @returns {Promise<module:ol/format/Feature~FeatureFormat|undefined>}
     */
    async getSourceFormat () {
      return (await this.resolveSource()).getFormat()
    },
    /**
     * @returns {Promise<boolean>}
     */
    async getSourceOverlaps () {
      return (await this.resolveSource()).getOverlaps()
    },
    /**
     * @returns {Promise<string|function|undefined>}
     */
    async getSourceUrl () {
      return (await this.resolveSource()).getUrl()
    },
    /**
     * @param {string|function} url
     * @returns {Promise<void>}
     */
    async setSourceUrl (url) {
      await this.setSourceUrlInternal(this.newUrlFunc(url))
    },
    /**
     * @param {string|function} url
     * @returns {Promise<void>}
     * @protected
     */
    async setSourceUrlInternal (url) {
      (await this.resolveSource()).setUrl(url)
      await this.reload()
    },
    /**
     * @param {function} loader
     * @returns {Promise<void>}
     */
    async setSourceLoader (loader) {
      await this.setSourceLoaderInternal(this.wrapLoaderFunc(loader))
    },
    /**
     * @param {function} loader
     * @returns {Promise<void>}
     * @protected
     */
    async setSourceLoaderInternal (loader) {
      (await this.resolveSource()).setLoader(loader)
      await this.reload()
    },
    /**
     * @param {number[]} extent
     * @returns {Promise<void>}
     */
    async removeSourceLoadedExtent (extent) {
      (await this.resolveSource()).removeLoadedExtent(this.extentToViewProj(extent))
    },
    /**
     * @param {string|function|undefined} url
     * @return {function|undefined}
     * @protected
     */
    newUrlFunc (url) {
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
    newLoaderFunc (loader) {
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
        if (!isArray(features)) {
          features = this.readSourceData(features)
        }
        if (isArray(features)) {
          this.addFeatures(features)
        }
      }
    },
    addFeaturesToSource: featuresContainer.methods.addFeatures,
    addFeatureToSource: featuresContainer.methods.addFeature,
    removeFeaturesFromSource: featuresContainer.methods.removeFeatures,
    removeFeatureFromSource: featuresContainer.methods.removeFeature,
    getSourceFeatures: featuresContainer.methods.getFeatures,
    getSourceFeaturesCollection: featuresContainer.methods.getFeaturesCollection,
    getSourceFeatureById: featuresContainer.methods.getFeatureById,
    /**
     * @param {module:ol/Feature~Feature} feature
     * @returns {Promise<boolean>}
     */
    async sourceHasFeature (feature) {
      return (await this.resolveSource()).hasFeature(feature)
    },
    /**
     * @returns {Promise<boolean>}
     */
    async isSourceEmpty () {
      return (await this.resolveSource()).isEmpty()
    },
    /**
     * @param {*} data
     * @returns {Array<module:ol/Feature~Feature>}
     */
    readSourceData (data) {
      return this.dataFormat.readFeatures(data, {
        featureProjection: this.viewProjection,
        dataProjection: this.resolvedDataProjection,
      })
    },
    /**
     * @returns {Promise<void>}
     * @protected
     */
    async init () {
      await this::source.mount()
      await this.addFeatures(this.mappedFeatures)
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
