<script>
  import TileArcGISRestSource from 'ol/source/TileArcGISRest'
  import { tileSource, arcgisSource } from '../../mixin'

  export default {
    name: 'VlSourceArcgisRest',
    mixins: [
      tileSource,
      arcgisSource,
    ],
    props: {
      url: {
        type: String,
        required: true,
        validator: value => !!value.length,
      },
    },
    methods: {
      createSource () {
        return new TileArcGISRestSource({
          attributions: this.attributions,
          cacheSize: this.cacheSize,
          crossOrigin: this.crossOrigin,
          params: this.allParams,
          tileGrid: this.tileGrid,
          projection: this.projection,
          reprojectionErrorThreshold: this.reprojectionErrorThreshold,
          tileLoadFunction: this.resolvedTileLoadFunc,
          url: this.urlTmpl,
          wrapX: this.wrapX,
          transition: this.transition,
        })
      },
    },
  }
</script>
