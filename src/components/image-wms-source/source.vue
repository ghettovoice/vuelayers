<script>
  import { ImageWMS as ImageWMSSource } from 'ol/source'
  import { imageSource, wmsSource } from '../../mixins'
  import { negate, isEmpty } from '../../utils'

  export default {
    name: 'VlSourceImageWms',
    mixins: [
      wmsSource,
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
        validator: /*#__PURE__*/negate(isEmpty),
      },
    },
    methods: {
      createSource () {
        return new ImageWMSSource({
          // ol/source/Source
          attributions: this.currentAttributions,
          projection: this.projection,
          // ol/source/Image
          resolutions: this.resolutions,
          // ol/source/ImageWMS
          crossOrigin: this.crossOrigin,
          hidpi: this.hidpi,
          serverType: this.serverType,
          imageLoadFunction: this.imageLoadFunc,
          params: this.allParams,
          ratio: this.ratio,
          url: this.url,
        })
      },
    },
  }
</script>
