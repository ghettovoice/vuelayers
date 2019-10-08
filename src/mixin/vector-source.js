import debounce from 'debounce-promise'
import { createGeoJsonFmt, getFeatureId, initializeFeature, isGeoJSONFeature, loadingAll, transform } from '../ol-ext'
import { constant, difference, isArray, isEqual, isFunction, pick, stubArray } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import { makeWatchers } from '../util/vue-helpers'
import featuresContainer from './features-container'
import projTransforms from './proj-transforms'
import source from './source'

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
     * @type {(function(): Feature)} formatFactory
     */
    formatFactory: {
      type: Function,
      default: createGeoJsonFmt,
    },
    /**
     * Source loader factory.
     * Source loader should load features from some remote service, decode them and pas to `features` prop to render.
     * @type {(function(): FeatureLoader|undefined)} loaderFactory
     */
    loaderFactory: {
      type: Function,
    },
    /**
     * Loading strategy factory.
     * Extent here in map view projection.
     * @type {(function(): LoadingStrategy)} strategyFactory
     */
    strategyFactory: {
      type: Function,
      default: () => loadingAll,
    },
    /**
     * String or url factory
     * @type {(string|function(): string|FeatureUrlFunction|undefined)} url
     */
    url: [String, Function],
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
      return this.newLoaderFunc(this.loaderFactory)
    },
    /**
     * @returns {function}
     */
    loadingStrategy () {
      return this.strategyFactory()
    },
    /**
     * @returns {function}
     */
    dataFormat () {
      return this.formatFactory()
    },
  },
  watch: {
    features: {
      deep: true,
      handler (features) {
        if (!this.$source || isEqual(features, this.featuresDataProj)) return

        features = features.map(feature => initializeFeature({ ...feature }))
        this.addFeatures(features)

        const forRemove = difference(this.featuresDataProj, features, (a, b) => getFeatureId(a) === getFeatureId(b))
        this.removeFeatures(forRemove)
      },
    },
    featuresDataProj: {
      deep: true,
      handler: debounce(function (features) {
        this.$emit('update:features', features)
      }, 1000 / 60),
    },
    async urlFunc (value) {
      this.setUrlInternal(value)
    },
    async loaderFunc (value) {
      this.setLoaderInternal(value)
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
    async forEachFeature (callback) {
      (await this.resolveSource()).forEachFeature(callback)
    },
    /**
     * @param {number[]} coordinate
     * @param {function} callback
     * @returns {Promise<*|T>}
     */
    async forEachFeatureAtCoordinateDirect (coordinate, callback) {
      coordinate = this.pointToViewProj(coordinate)

      return (await this.resolveSource()).forEachFeatureAtCoordinateDirect(coordinate, callback)
    },
    /**
     * @param {number[]} extent
     * @returns {Promise<*|T>}
     */
    async forEachFeatureInExtent (extent) {
      extent = this.extentToViewProj(extent)

      return (await this.resolveSource()).forEachFeatureInExtent(extent)
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
      await this.setUrlInternal(this.newUrlFunc(url))
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
     */
    wrapUrlFunc (urlFunc) {
      return (extent, resolution, projection) => {
        extent = transformExtent(extent, projection, this.resolvedDataProjection)
        projection = this.resolvedDataProjection

        return urlFunc(extent, resolution, projection)
      }
    },
    /**
     * @param {function|undefined} loaderFactory
     * @return {function|undefined}
     * @protected
     */
    newLoaderFunc (loaderFactory) {
      if (!isFunction(loaderFactory)) return

      const loader = loaderFactory()
      if (!isFunction(loader)) return

      return this.wrapLoaderFunc(loader)
    },
    /**
     * @param {function} loaderFunc
     * @returns {Function}
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
    /**
     * @returns {Promise<void>}
     */
    async reload () {
      (await this.resolveSource()).refresh()
    },
    /**
     * @return {void}
     */
    clear () {
      this::featuresContainer.methods.clearFeatures()
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
