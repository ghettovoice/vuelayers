<script>
  import Vue from 'vue'
  import uuid from 'uuid/v4'
  import VectorSource from 'ol/source/vector'
  import loadingstrategy from 'ol/loadingstrategy'
  import { differenceWith, isPlainObject } from 'lodash/fp'
  import { EPSG_4326, geoJson, extent, proj, tileGrid } from '../../../ol-ext'
  import source from '../source'
  import * as assert from '../../../utils/assert'

  const props = {
    // for big datasets
    features: {
      type: Array,
      default: () => []
    },
    loader: Function,
    /**
     * Loading strategy factory
     * @type {function(helper: Object): ol.LoadingStrategy}
     */
    strategyFactory: {
      type: Function,
      default: defaultStrategyFactory
    },
    projection: {
      type: String,
      default: EPSG_4326
    },
    useSpatialIndex: {
      type: Boolean,
      default: true
    }
    // todo implement options (tiled loading strategy & etc)
    // format: String,
    // strategy: String
  }

  const methods = {
    /**
     * @param {Array<(ol.Feature|Vue|GeoJSONFeature)>} features
     * @return {void}
     */
    addFeatures (features) {
      features.forEach(this.addFeature)
    },
    /**
     * @param {ol.Feature|Vue|GeoJSONFeature} feature
     * @return {void}
     */
    addFeature (feature) {
      assert.hasMap(this)
      assert.hasSource(this)

      if (feature instanceof Vue) {
        feature = feature.feature
      } else if (isPlainObject(feature)) {
        feature = geoJson.readFeature(feature, this.map.view.getProjection())
      }
      if (feature.getId() == null) {
        feature.setId(uuid())
      }
      this.source.addFeature(feature)
    },
    /**
     * @param {Array<(ol.Feature|Vue|GeoJSONFeature)>} features
     * @return {void}
     */
    removeFeatures (features) {
      features.forEach(this.removeFeature)
    },
    /**
     * @param {ol.Feature|Vue|GeoJSONFeature} feature
     * @return {void}
     */
    removeFeature (feature) {
      assert.hasSource(this)

      if (feature instanceof Vue) {
        feature = feature.feature
      } else if (isPlainObject(feature)) {
        feature = this.source.getFeatureById(feature.id)
      }
      this.source.removeFeature(feature)
    },
    /**
     * @return {void}
     */
    clear () {
      assert.hasSource(this)
      this.source.clear()
    },
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
     * @param {string|number} id
     * @return {ol.Feature|undefined}
     */
    getFeatureById (id) {
      assert.hasMap(this)
      assert.hasSource(this)

      return this.source.getFeatureById(id)
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this::source.methods.mount()
      this.addFeatures(this.features)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.clear()
      this::source.methods.unmount()
    }
  }

  const diffById = differenceWith((a, b) => a.id === b.id)
  const watch = {
    features (value, oldValue) {
      if (!this.source) return

      let forAdd = diffById(value, oldValue)
      let forRemove = diffById(oldValue, value)

      this.addFeatures(forAdd)
      this.removeFeatures(forRemove)
    }
  }

  export default {
    name: 'vl-source-vector',
    mixins: [source],
    props,
    methods,
    watch,
    stubVNode: {
      empty: false,
      attrs () {
        return {
          id: this.$options.name
        }
      }
    }
  }

  /**
   * @param {{strategy: Object, extent: Object, proj: Object, tileGrid: Object}} h Helper
   * @return {ol.LoadingStrategy}
   */
  function defaultStrategyFactory ({ strategy }) {
    return strategy.bbox
  }
</script>
