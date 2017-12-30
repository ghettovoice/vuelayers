<script>
  import VectorSource from 'ol/source/vector'
  import { differenceWith, stubArray, isFunction, constant, isFinite } from 'lodash/fp'
  import { loadStrategyHelper, formatHelper, vectorSource, projHelper, featureHelper } from '../../core'

  const props = {
    /**
     * Array of GeoJSON encoded features with coordinates in provided projection.
     * @type {GeoJSONFeature[]} features
     */
    features: {
      type: Array,
      default: stubArray,
    },
    /**
     * Source loader factory.
     * Source loader should load features from some remote service, decode them and pas to `features` prop to render.
     * @type {(function(): ol.FeatureLoader|undefined)} loaderFactory
     */
    loaderFactory: Function,
    /**
     * Source format factory
     * @type {(function(): ol.format.Feature|undefined)} formatFactory
     */
    formatFactory: {
      type: Function,
      default: defaultFormatFactory,
    },
    /**
     * String or url factory
     * @type {(string|function(): string|ol.FeatureUrlFunction|undefined)} url
     */
    url: [String, Function],
    /**
     * Loading strategy factory.
     * Extent here in map view projection.
     * @type {(function(): ol.LoadingStrategy|undefined)} strategyFactory
     */
    strategyFactory: {
      type: Function,
      default: defaultStrategyFactory,
    },
    overlaps: {
      type: Boolean,
      default: true,
    },
  }

  const computed = {
    featureIds () {
      return this.features.map(featureHelper.getId)
    },
    strategy () {
      // do not transform extent in strategy cause here we need
      // extent in map project units
      return this.strategyFactory()
    },
    loader () {
      if (!this.loaderFactory) {
        return
      }
      const loader = this.loaderFactory()
      // wrap strategy function to transform map view projection to source projection
      return (extent, resolution, projection) => loader(
        transformExtent(extent, projection, this.projection),
        resolution,
        this.projection,
      )
    },
    urlFunc () {
      if (!this.url) {
        return
      }
      let url = this.url
      if (!isFunction(url)) {
        url = constant(this.url)
      }
      // wrap strategy function to transform map view projection to source projection
      return (extent, resolution, projection) => url(
        transformExtent(extent, projection, this.projection),
        resolution,
        this.projection,
      )
    },
    format () {
      return this.formatFactory()
    },
  }

  const methods = {
    /**
     * @return {ol.source.Vector}
     * @protected
     */
    createSource () {
      return new VectorSource({
        attributions: this.attributions,
        projection: this.projection,
        loader: this.loader,
        useSpatialIndex: this.useSpatialIndex,
        wrapX: this.wrapX,
        logo: this.logo,
        strategy: this.strategy,
        format: this.format,
        url: this.urlFunc,
        overlaps: this.overlaps,
      })
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this::vectorSource.methods.mount()
      this.addFeatures(this.features, this.projection)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.clear()
      this::vectorSource.methods.unmount()
    },
  }

  const diffById = differenceWith((a, b) => a.id === b.id)
  const watch = {
    features (value, oldValue) {
      if (!this.$source) return

      let forAdd = diffById(value, oldValue)
      let forRemove = diffById(oldValue, value)

      this.addFeatures(forAdd, this.projection)
      this.removeFeatures(forRemove)
    },
  }

  export default {
    name: 'vl-source-vector',
    mixins: [vectorSource],
    props,
    computed,
    methods,
    watch,
  }

  /**
   * @return {ol.LoadingStrategy}
   */
  function defaultStrategyFactory () {
    return loadStrategyHelper.all
  }

  /**
   * @return {ol.format.GeoJSON}
   */
  function defaultFormatFactory () {
    return formatHelper.geoJson()
  }

  function transformExtent (extent, sourceProj, destProj) {
    extent = extent.slice()
    if (isFinite(extent[0]) && isFinite(extent[1])) {
      [extent[0], extent[1]] = projHelper.transform([extent[0], extent[1]], sourceProj, destProj)
    }
    if (isFinite(extent[2]) && isFinite(extent[3])) {
      [extent[2], extent[3]] = projHelper.transform([extent[2], extent[3]], sourceProj, destProj)
    }
    return extent
  }
</script>
