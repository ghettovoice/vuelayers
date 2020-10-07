<script>
  import { ImageArcGISRest as ImageArcGISRestSource } from 'ol/source'
  import { imageSource, arcgisSource } from '../../mixins'
  import { negate, isEmpty, makeWatchers, isEqual } from '../../utils'

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
        validator: /*#__PURE__*/negate(isEmpty),
      },
    },
    watch: {
      async url (value) {
        await this.setUrl(value)
      },
      .../*#__PURE__*/makeWatchers([
        'crossOrigin',
        'imageLoadFunc',
        'ratio',
      ], prop => async function (val, prev) {
        if (isEqual(val, prev)) return

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`${prop} changed, scheduling recreate...`)
        }

        await this.scheduleRecreate()
      }),
    },
    methods: {
      createSource () {
        return new ImageArcGISRestSource({
          // ol/source/Source
          attributions: this.currentAttributions,
          projection: this.resolvedDataProjection,
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
