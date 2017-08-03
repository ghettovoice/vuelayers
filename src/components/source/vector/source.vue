<script>
  import VectorSource from 'ol/source/vector'
  import FeatureFormat from 'ol/format/feature'
  import GeoJSONFormat from 'ol/format/GeoJSON'
  import { differenceWith, stubArray, isFunction } from 'lodash/fp'
  import * as olExt from '../../../ol-ext'
  import vectSource from '../vect'

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
     * @type {function(olExt: Object): ol.FeatureLoader|undefined} loaderFactory
     */
    loaderFactory: Function,
    /**
     * Source format factory
     * @type {function(olExt: Object): ol.format.Feature} formatFactory
     */
    formatFactory: Function,
    /**
     * String or url function factory
     * @type {string|function(olExt: Object): ol.FeatureUrlFunction} url
     */
    url: [String, Function],
    /**
     * Loading strategy factory
     * @type {function(olExt: Object): ol.LoadingStrategy} strategyFactory
     */
    strategyFactory: {
      type: Function,
      default: () => defaultStrategyFactory
    },
    overlaps: {
      type: Boolean,
      default: true
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
        loader: this.$loader,
        useSpatialIndex: this.useSpatialIndex,
        wrapX: this.wrapX,
        logo: this.logo,
        strategy: this.$strategy,
        format: this.$format
        url: this.$url,
        overlaps: this.overlaps
      })
    },
    /**
     * @return {void}
     * @private
     */
    defineAccessors () {
      this::source.methods.defineAccessors()
      Object.defineProperties(this, {
        $strategy: {
          enumerable: true,
          get: this.getStrategy
        },
        $format: {
          enumerable: true,
          get: this.getFormat
        },
        $loader: {
          enumerable: true,
          get: this.getLoader
        },
        $url: {
          enumerable: true,
          get: this.getUrl
        }
      })
    },
    /**
     * @return {ol.FeatureLoader|undefined}
     */
    getLoader () {
      if (!this._loader && this.loaderFactory) {
        /**
         * @type {ol.FeatureLoader|undefined}
         * @private
         */
        this._loader = this.loaderFactory(olExt)
      }

      return this._loader
    },
    /**
     * @return {ol.LoadingStrategy}
     */
    getStrategy () {
      if (!this._strategy) {
        /**
         * @type {ol.LoadingStrategy}
         * @private
         */
        this._strategy = this.strategyFactory(olExt)
      }

      return this._strategy
    },
    /**
     * @return {ol.format.Feature|undefined}
     */
    getFormat () {
      if (!this._format && this.formatFactory) {
        /**
         * @type {ol.format.Feature|undefined}
         * @private
         */
        this._format = this.formatFactory(olExt)
      }

      return this._format
    },
    /**
     * @return {string|ol.FeatureUrlFunction|undefined}
     */
    getUrl () {
      if (isFunction(this.url) && !this._url) {
        /**
         * @type {string|ol.FeatureUrlFunction|undefined}
         */
        this._url = this.url(olExt)
      } else {
        this._url = this.url
      }

      return this._url
    },
    /**
     * @return {void|Promise<void>}
     * @protected
     */
    deinit () {
      this._strategy = this._loader = this._format = undefined

      return this::source.methods.deinit()
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
    methods,
    watch
  }

  /**
   * @param {Object} olExt OpenLayers Helper
   * @return {ol.LoadingStrategy}
   */
  function defaultStrategyFactory ({ loadStrategy }) {
    return loadStrategy.bbox
  }
</script>
