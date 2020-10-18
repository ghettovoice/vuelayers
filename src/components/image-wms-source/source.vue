<script>
  import { ImageWMS as ImageWMSSource } from 'ol/source'
  import { imageSource, wmsSource } from '../../mixins'
  import { negate, isEmpty, makeWatchers, isEqual } from '../../utils'
  import sequential from '../../utils/sequential'

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
    watch: {
      url: /*#__PURE__*/sequential(async function (value) {
        await this.setUrl(value)
      }),
      .../*#__PURE__*/makeWatchers([
        'crossOrigin',
        'imageLoadFunc',
        'ratio',
      ], prop => /*#__PURE__*/sequential(async function (val, prev) {
        if (isEqual(val, prev)) return

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`${prop} changed, scheduling recreate...`)
        }

        await this.scheduleRecreate()
      })),
    },
    methods: {
      createSource () {
        return new ImageWMSSource({
          // ol/source/Source
          attributions: this.currentAttributions,
          projection: this.resolvedDataProjection,
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
      async getUrl () {
        return (await this.resolveSource()).getUrl()
      },
      async setUrl (url) {
        if (url === await this.getUrl()) return

        (await this.resolveSource()).setUrl(url)
      },
    },
  }
</script>
