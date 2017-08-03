<script>
  import VectorSource from 'ol/source/vector'
  import loadingstrategy from 'ol/loadingstrategy'
  import FeatureFormat from 'ol/format/feature'
  import GeoJSONFormat from 'ol/format/GeoJSON'
  import { differenceWith, stubArray } from 'lodash/fp'
  import { extent, proj, tileGrid } from '../../../ol-ext'
  import vectSource from '../vect'

  // todo add support of format, url and default xhr loader
  const props = {
    /**
     * @type {Array<(GeoJSONFeature|Vue|ol.Feature)>} features
     */
    features: {
      type: Array,
      default: stubArray
    },
    loader: Function,
    /**
     * Loading strategy factory
     * @type {function(helper: Object): ol.LoadingStrategy} strategyFactory
     */
    strategyFactory: {
      type: Function,
      default: () => defaultStrategyFactory
    },
    /**
     * @type {function(): ol.format.Feature}
     */
    formatFactory: {
      type: Function,
      default: () => defaultFormaFactory
    },
    url: String,
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
        loader: this.sourceLoader(),
        useSpatialIndex: this.useSpatialIndex,
        wrapX: this.wrapX,
        logo: this.logo,
        strategy: this.strategyFactory({
          strategy: loadingstrategy,
          extent,
          proj,
          tileGrid
        })
        // url: this.url,
      })
    },
    /**
     * @return {function|undefined}
     * @protected
     */
    sourceLoader () {
      if (!this.loader) return

      const loader = this.loader
      // todo add format property, read loaded features
      return function __vectorSourceLoader (extent, resolution, projection) {
        loader(extent, resolution, projection)
      }
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
   * @param {{strategy: Object, extent: Object, proj: Object, tileGrid: Object}} h Helper
   * @return {ol.LoadingStrategy}
   */
  function defaultStrategyFactory ({ strategy }) {
    return strategy.bbox
  }
</script>
