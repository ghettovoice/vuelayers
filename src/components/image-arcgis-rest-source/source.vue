<script>
  import { ImageArcGISRest as ImageArcGISRestSource } from 'ol/source'
  import { imageSource, arcgisSource } from '../../mixin'
  import { negate, isEmpty } from '../../util/minilo'

  export default {
    name: 'VlSourceImageArcgisRest',
    mixins: [
      arcgisSource,
      imageSource,
    ],
    props: {
      // ol/source/ImageArcGISRest
      crossOrigin: String,
      imageLoadFunc: Function,
      ratio: {
        type: Number,
        default: 1.5,
      },
      url: {
        type: String,
        required: true,
        validator: negate(isEmpty),
      },
    },
    methods: {
      createSource () {
        return new ImageArcGISRestSource({
          // ol/source/Source
          attributions: this.currentAttributions,
          projection: this.projection,
          // ol/source/Image
          resolutions: this.resolutions,
          // ol/source/ImageArcGISRest
          crossOrigin: this.crossOrigin,
          hidpi: this.hidpi,
          imageLoadFunction: this.imageLoadFunc,
          params: this.allParams,
          ratio: this.ratio,
          url: this.url,
        })
      },
    },
  }
</script>
