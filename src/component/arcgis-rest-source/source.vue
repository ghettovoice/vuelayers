<script>
  import TileArcGISRestSource from 'ol/source/TileArcGISRest'
  import { tileSource, arcgisSource } from '../../mixin'

  export default {
    name: 'vl-source-arcgis-rest',
    mixins: [tileSource, arcgisSource],
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
          tileGrid: this._tileGrid,
          projection: this.projection,
          reprojectionErrorThreshold: this.reprojectionErrorThreshold,
          tileLoadFunction: this.tileLoadFunction,
          url: this.urlTmpl,
          wrapX: this.wrapX,
          transition: this.transition,
        })
      },
    },
  }
</script>
