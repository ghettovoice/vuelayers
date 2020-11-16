<script>
  import { ImageArcGISRest as ImageArcGISRestSource } from 'ol/source'
  import { arcgisSource, imageSource, makeChangeOrRecreateWatchers } from '../../mixins'
  import { and, assert, coalesce, isEmpty, isFunction, isString, negate, noop } from '../../utils'

  const validateUrl = /*#__PURE__*/and(isString, negate(isEmpty))

  export default {
    name: 'VlSourceImageArcgisRest',
    mixins: [
      arcgisSource,
      imageSource,
    ],
    props: {
      // ol/source/ImageArcGISRest
      crossOrigin: String,
      imageLoadFunction: Function,
      /**
       * @deprecated
       * @todo remove later
       */
      imageLoadFunc: Function,
      imageSmoothing: {
        type: Boolean,
        default: true,
      },
      ratio: {
        type: Number,
        default: 1.5,
      },
      url: {
        type: String,
        required: true,
        validator: validateUrl,
      },
    },
    data () {
      return {
        currentImageLoadFunction: this.imageLoadFunction,
        currentUrl: this.url,
      }
    },
    computed: {
      inputImageLoadFunction () {
        return this.imageLoadFunction || this.imageLoadFunc
      },
    },
    watch: {
      rev () {
        if (!this.$source) return

        if (this.currentImageLoadFunction !== this.$source.getImageLoadFunction()) {
          this.currentImageLoadFunction = this.$source.getImageLoadFunction()
        }
        if (this.currentUrl !== this.$source.getUrl()) {
          this.currentUrl = this.$source.getUrl()
        }
      },
      url (value) {
        this.setUrl(value)
      },
      currentUrl (value) {
        if (value === this.url) return

        this.$emit('update:url', value)
      },
      inputImageLoadFunction (value) {
        this.setImageLoadFunction(value)
      },
      currentImageLoadFunction (value) {
        if (value === this.imageLoadFunction) return

        this.$emit('update:imageLoadFunction', value)
      },
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'crossOrigin',
        'imageSmoothing',
        'ratio',
      ]),
    },
    created () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.imageLoadFunc) {
          this.$logger.warn("'imageLoadFunc' prop is deprecated. Use 'imageLoadFunction' prop instead.")
        }
      }

      this.currentImageLoadFunction = this.inputImageLoadFunction
    },
    updated () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.imageLoadFunc) {
          this.$logger.warn("'imageLoadFunc' prop is deprecated. Use 'imageLoadFunction' prop instead.")
        }
      }
    },
    methods: {
      createSource () {
        return new ImageArcGISRestSource({
          // ol/source/Source
          attributions: this.currentAttributions,
          projection: this.resolvedDataProjection,
          // ol/source/Image
          resolutions: this.inputResolutions,
          // ol/source/ImageArcGISRest
          crossOrigin: this.crossOrigin,
          hidpi: this.hidpi,
          imageLoadFunction: this.currentImageLoadFunction,
          imageSmoothing: this.imageSmoothing,
          params: this.currentParams,
          ratio: this.ratio,
          url: this.currentUrl,
        })
      },
      getUrl () {
        return coalesce(this.$source?.getUrl(), this.currentUrl)
      },
      setUrl (url) {
        assert(validateUrl(url), 'Invalid url')

        if (url !== this.currentUrl) {
          this.currentUrl = url
        }
        if (this.$source && url !== this.$source.getUrl()) {
          this.$source.setUrl(url)
        }
      },
      getImageLoadFunction () {
        return coalesce(this.$source?.getImageLoadFunction(), this.currentImageLoadFunction)
      },
      setImageLoadFunction (func) {
        assert(isFunction(func), 'Invalid image load function')

        if (func !== this.currentImageLoadFunction) {
          this.currentImageLoadFunction = func
        }
        if (this.$source && func !== this.$source.getImageLoadFunction()) {
          this.$source.setImageLoadFunction(func)
        }
      },
      stateChanged: noop,
    },
  }
</script>
