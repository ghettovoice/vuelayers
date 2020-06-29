<script>
  import { Vector as VectorSource } from 'ol/source'
  import { vectorSource } from '../../mixins'

  export default {
    name: 'VlSourceVector',
    mixins: [
      vectorSource,
    ],
    methods: {
      /**
       * @return {module:ol/source/Vector~VectorSource}
       * @protected
       */
      createSource () {
        return new VectorSource({
          // ol/source/Source
          attributions: this.currentAttributions,
          attributionsCollapsible: this.attributionsCollapsible,
          projection: this.resolvedDataProjection,
          wrapX: this.wrapX,
          // ol/source/Vector
          format: this.format,
          loader: this.loaderFunc,
          strategy: this.loadingStrategyFunc,
          url: this.urlFunc,
          overlaps: this.overlaps,
          useSpatialIndex: this.useSpatialIndex,
        })
      },
    },
  }
</script>
