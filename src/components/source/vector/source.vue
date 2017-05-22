<script>
  import VectorSource from 'ol/source/vector'
  import loadingstrategy from 'ol/loadingstrategy'
  import { merge, differenceWith } from 'lodash/fp'
  import { consts, extentHelper, geoJson } from '../../../ol-ext'
  import source from '../source'
  import { assertHasLayer, assertHasSource, assertHasView } from '../../../utils/assert'

  const { toLonLat: extentToLonLat } = extentHelper
  const { LAYER_PROP, DATA_PROJECTION } = consts

  const props = {
    // for big datasets
    features: {
      type: Array,
      default: () => []
    },
    loader: Function,
    projection: {
      type: String,
      default: DATA_PROJECTION
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
     * @return {void}
     */
    clear () {
      assertHasSource(this)
      this.source.clear()
    },
    // protected & private
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
        projection = projection.getCode()
        extent = extentToLonLat(extent, projection)

        const features = await Promise.resolve(loader(extent, resolution, projection))

        if (features && features.length) {
          vm.$emit('load', {
            features,
            extent,
            resolution,
            projection
          })
        }
      }
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this::source.methods.mount()

      if (this.features.length) {
        this.source.addFeatures(this.features.map(this::createFeature))
      }
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this::source.methods.unmount()
      this.clear()
    }
  }

  const diffById = differenceWith((a, b) => a.id === b.id)
  const watch = {
    features (value, oldValue) {
      assertHasSource(this)

      let forAdd = diffById(value, oldValue)
      let forRemove = diffById(oldValue, value)

      this.source.addFeatures(forAdd.map(this::createFeature))
      forRemove.map(geoJsonFeature => {
        const feature = this.source.getFeatureById(geoJsonFeature.id)

        if (feature) {
          this.source.removeFeature(feature)
          feature.unset(LAYER_PROP)
        }
      })
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
   * @param {GeoJSONFeature} geoJsonFeature
   * @return {ol.Feature}
   */
  function createFeature (geoJsonFeature) {
    assertHasSource(this)
    assertHasView(this)
    assertHasLayer(this)

    return geoJson.readFeature(merge(geoJsonFeature, {
      properties: {
        [LAYER_PROP]: this.layer.get('id')
      }
    }), this.view.getProjection())
  }
</script>
