<script>
  import { Vector as VectorSource } from 'ol/source'
  import { vectorSource } from '../../mixin'

  export default {
    name: 'VlSourceVector',
    mixins: [vectorSource],
    methods: {
      /**
       * @return {module:ol/source/Vector~VectorSource}
       * @protected
       */
      createSource () {
        return new VectorSource({
          attributions: this.attributions,
          attributionsCollapsible: this.attributionsCollapsible,
          projection: this.resolvedDataProjection,
          wrapX: this.wrapX,
          features: this.$featuresCollection,
          format: this.dataFormat,
          loader: this.loaderFunc,
          strategy: this.loadingStrategy,
          url: this.urlFunc,
          overlaps: this.overlaps,
          useSpatialIndex: this.useSpatialIndex,
        })
      },
    },
  }
</script>
