<script>
  import VectorSource from 'ol/source/vector'
  import { differenceWith, stubArray, isFunction } from 'lodash/fp'
  import vectSource from '../vect'
  import { loadStrategy } from '../../../ol-ext'

  const props = {
    /**
     * @type {GeoJSONFeature[]} features
     */
    features: {
      type: Array,
      default: stubArray
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
    formatFactory: Function,
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
      default: defaultStrategyFactory
    },
    overlaps: {
      type: Boolean,
      default: true
    }
  }

  const computed = {
    strategy () {
      if (this.strategyFactory) {
        return this.strategyFactory()
      }
    },
    loader () {
      if (this.loaderFactory) {
        return this.loaderFactory()
      }
    },
    urlFunc () {
      if (this.url) {
        return isFunction(this.url) ? this.url() : () => this.url
      }
    },
    format () {
      if (this.formatFactory) {
        return this.formatFactory()
      }
    }
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
        overlaps: this.overlaps
      })
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this::vectSource.methods.mount()
      this.addFeatures(this.features)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.clear()
      this::vectSource.methods.unmount()
    }
  }

  const diffById = differenceWith((a, b) => a.id === b.id)
  const watch = {
    features (value, oldValue) {
      if (!this.$source) return

      let forAdd = diffById(value, oldValue)
      let forRemove = diffById(oldValue, value)

      this.addFeatures(forAdd)
      this.removeFeatures(forRemove)
    }
  }

  export default {
    name: 'vl-source-vector',
    mixins: [vectSource],
    props,
    computed,
    methods,
    watch
  }

  /**
   * @return {ol.LoadingStrategy}
   */
  function defaultStrategyFactory () {
    return loadStrategy.bbox
  }
</script>
