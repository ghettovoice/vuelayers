<script>
  import { ImageStatic as ImageStaticSource } from 'ol/source'
  import { imageSource, makeChangeOrRecreateWatchers } from '../../mixins'
  import { coalesce, isEmpty, negate, noop } from '../../utils'

  /**
   * A layer source for displaying a single, static image.
   */
  export default {
    name: 'VlSourceImageStatic',
    mixins: [
      imageSource,
    ],
    props: {
      // ol/source/ImageStatic
      crossOrigin: String,
      /**
       * Image extent in the source projection.
       * @type {number[]}
       */
      imageExtent: {
        type: Array,
        // required: true,
        validator: value => value.length === 4,
      },
      /**
       * @deprecated
       * @todo remove later
       */
      imgExtent: {
        type: Array,
        validator: value => value.length === 4,
      },
      /**
       * @deprecated Use `imgExtent` instead.
       * @todo remove in v0.13.x
       */
      extent: {
        type: Array,
        validator: value => value.length === 4,
      },
      /**
       * Optional function to load an image given a URL.
       * @type {function|undefined}
       */
      imageLoadFunction: Function,
      /**
       * @deprecated
       * @todo remove later
       */
      imgLoadFunc: Function,
      /**
       * @deprecated Use `imgLoadFunc` instead.
       * @todo remove in v0.13.x
       */
      loadFunc: Function,
      /**
       * Image size in pixels.
       * @type {number[]}
       */
      imageSize: {
        type: Array,
        validator: value => value.length === 2,
      },
      /**
       * @deprecated
       * @todo remove later
       */
      imgSize: {
        type: Array,
        validator: value => value.length === 2,
      },
      /**
       * @deprecated Use `imgSize` instead.
       * @todo remove in v0.13.x
       */
      size: {
        type: Array,
        validator: value => value.length === 2,
      },
      /**
       * @type {boolean}
       */
      imageSmoothing: {
        type: Boolean,
        default: true,
      },
      /**
       * Image URL.
       * @type {string}
       */
      url: {
        type: String,
        required: true,
        validator: /*#__PURE__*/negate(isEmpty),
      },
    },
    computed: {
      inputImageExtent () {
        return coalesce(this.imageExtent, this.imgExtent, this.extent)?.slice()
      },
      inputImageLoadFunction () {
        return coalesce(this.imageLoadFunction, this.imgLoadFunc, this.loadFunc)
      },
      inputImageSize () {
        return coalesce(this.imageSize, this.imgSize, this.size)?.slice()
      },
    },
    watch: {
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'crossOrigin',
        'inputImageExtent',
        'inputImageLoadFunction',
        'inputImageSize',
        'imageSmoothing',
        'url',
      ], [
        'inputImageExtent',
        'inputImageSize',
      ]),
    },
    created () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.extent) {
          this.$logger.warn("'extent' is deprecated. Use `imageExtent` prop instead.")
        }
        if (this.imgExtent) {
          this.$logger.warn("'imgExtent' is deprecated. Use `imageExtent` prop instead.")
        }
        if (this.loadFunc) {
          this.$logger.warn("'loadFunc' is deprecated. Use `imageLoadFunction` prop instead.")
        }
        if (this.imgLoadFunc) {
          this.$logger.warn("'imgLoadFunc' is deprecated. Use `imageLoadFunction` prop instead.")
        }
        if (this.size) {
          this.$logger.warn("'size' is deprecated. Use `imageSize` prop instead.")
        }
        if (this.imgSize) {
          this.$logger.warn("'imgSize' is deprecated. Use `imageSize` prop instead.")
        }
      }
    },
    updated () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.extent) {
          this.$logger.warn("'extent' is deprecated. Use `imageExtent` prop instead.")
        }
        if (this.imgExtent) {
          this.$logger.warn("'imgExtent' is deprecated. Use `imageExtent` prop instead.")
        }
        if (this.loadFunc) {
          this.$logger.warn("'loadFunc' is deprecated. Use `imageLoadFunction` prop instead.")
        }
        if (this.imgLoadFunc) {
          this.$logger.warn("'imgLoadFunc' is deprecated. Use `imageLoadFunction` prop instead.")
        }
        if (this.size) {
          this.$logger.warn("'size' is deprecated. Use `imageSize` prop instead.")
        }
        if (this.imgSize) {
          this.$logger.warn("'imgSize' is deprecated. Use `imageSize` prop instead.")
        }
      }
    },
    methods: {
      /**
       * @return {ImageStatic}
       * @protected
       */
      createSource () {
        return new ImageStaticSource({
          // ol/source/Source
          attributions: this.currentAttributions,
          projection: this.resolvedDataProjection,
          // ol/source/ImageStatic
          crossOrigin: this.crossOrigin,
          imageExtent: this.inputImageExtent,
          imageLoadFunction: this.inputImageLoadFunction,
          imageSize: this.inputImageSize,
          imageSmoothing: this.imageSmoothing,
          url: this.url,
        })
      },
      getUrl () {
        return coalesce(this.$source?.getUrl(), this.url)
      },
      getImageExtent () {
        return coalesce(this.$source?.getImageExtent(), this.inputImageExtent)
      },
      stateChanged: noop,
    },
  }
</script>
