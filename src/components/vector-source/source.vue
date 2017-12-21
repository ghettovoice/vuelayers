<script>
  import VectorSource from 'ol/source/vector'
  import { differenceWith, stubArray, isFunction, constant } from 'lodash/fp'
  import { loadStrategyHelper, formatHelper, vectorSource, projHelper } from '../../core'

  const props = {
    /**
     * @type {GeoJSONFeature[]} features
     */
    features: {
      type: Array,
      default: stubArray,
    },
    /**
     * Source loader factory
     * @type {function(): ol.FeatureLoader|undefined} loaderFactory
     */
    loaderFactory: Function,
    /**
     * Source format factory
     * @type {function(): ol.format.Feature} formatFactory
     */
    formatFactory: {
      type: Function,
      default: defaultFormatFactory,
    },
    /**
     * String or url factory
     * @type {string|function(): string|ol.FeatureUrlFunction} url
     */
    url: [String, Function],
    /**
     * Loading strategy factory
     * @type {function(): ol.LoadingStrategy} strategyFactory
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
      this.addFeatures(this.features)
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

      this.addFeatures(forAdd)
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
    created () {
      Object.defineProperties(this, {
        strategy: {
          enumerable: true,
          get () {
            if (this.strategyFactory) {
              // do not transform extent in strategy cause here we need
              // extent in map project units
              return this.strategyFactory()
            }
          },
        },
        loader: {
          enumerable: true,
          get () {
            if (this.loaderFactory) {
              const loader = this.loaderFactory()
              // wrap strategy function to transform map view projection to source projection
              return (extent, resolution, projection) => loader(
                projHelper.transformExtent(extent, projection, this.projection),
                resolution,
                this.projection,
              )
            }
          },
        },
        urlFunc: {
          enumerable: true,
          get () {
            if (this.url) {
              let url = this.url
              if (!isFunction(url)) {
                url = constant(this.url)
              }
              // wrap strategy function to transform map view projection to source projection
              return (extent, resolution, projection) => url(
                projHelper.transformExtent(extent, projection, this.projection),
                resolution,
                this.projection,
              )
            }
          },
        },
        format: {
          enumerable: true,
          get () {
            if (this.formatFactory) {
              return this.formatFactory()
            }
          },
        },
      })
    },
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
</script>
