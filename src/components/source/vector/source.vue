<script>
  import Vue from 'vue'
  import VectorSource from 'ol/source/vector'
  import loadingstrategy from 'ol/loadingstrategy'
  import { differenceWith, isPlainObject } from 'lodash/fp'
  import { DATA_PROJ, geoJson } from '../../../ol-ext'
  import source from '../source'
  import { assertHasSource, assertHasMap } from '../../../utils/assert'

  const props = {
    // for big datasets
    features: {
      type: Array,
      default: () => []
    },
    loader: Function,
    projection: {
      type: String,
      default: DATA_PROJ
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
      assertHasMap(this)
      assertHasSource(this)

      if (feature instanceof Vue) {
        feature = feature.feature
      } else if (isPlainObject(feature)) {
        feature = geoJson.readFeature(feature, this.map.view.getProjection())
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
      assertHasSource(this)

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
      assertHasSource(this)
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
        strategy: loadingstrategy.bbox
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
      const vm = this

      return async function __loader (extent, resolution, projection) {
        // todo закидывать хелпер
        await Promise.resolve(loader(extent, resolution, projection))
        vm.$emit('load', {
          extent,
          resolution,
          projection
        })
      }
    },
    /**
     * @param {string|number} id
     * @return {ol.Feature|undefined}
     */
    getFeatureById (id) {
      assertHasMap(this)
      assertHasSource(this)

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
</script>
