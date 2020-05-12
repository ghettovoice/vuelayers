<script>
  import ImageStaticSource from 'ol/source/ImageStatic'
  import { imageSource } from '../../mixin'
  import { negate, isEmpty } from '../../util/minilo'
  import { makeWatchers } from '../../util/vue-helpers'

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
      imgExtent: {
        type: Array,
        // required: true,
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
       * Image URL.
       * @type {string}
       */
      url: {
        type: String,
        required: true,
        validator: negate(isEmpty),
      },
    },
    computed: {
      resolvedImgExtent () {
        let extent = this.imgExtent
        if (!extent && this.extent) {
          extent = this.extent
        }

        return extent
      },
      resolvedImgLoadFunc () {
        let func = this.imgLoadFunc
        if (!func && this.loadFunc) {
          func = this.loadFunc
        }

        return func
      },
      resolvedImgSize () {
        let size = this.imgSize
        if (!size && this.size) {
          size = this.size
        }

        return size
      },
    },
    watch: {
      ...makeWatchers([
        'crossOrigin',
        'resolvedImgExtent',
        'resolvedImgLoadFunc',
        'resolvedImgSize',
        'url',
      ], prop => async function () {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`${prop} changed, scheduling recreate...`)
        }

        await this.scheduleRecreate()
      }),
    },
    created () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.extent) {
          this.$logger.warn("'extent' is deprecated. Use `imgExtent` prop instead.")
        }
        if (this.loadFunc) {
          this.$logger.warn("'loadFunc' is deprecated. Use `imgLoadFunc` prop instead.")
        }
        if (this.size) {
          this.$logger.warn("'size' is deprecated. Use `imgSize` prop instead.")
        }
      }
    },
    updated () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.extent) {
          this.$logger.warn("'extent' is deprecated. Use `imgExtent` prop instead.")
        }
        if (this.loadFunc) {
          this.$logger.warn("'loadFunc' is deprecated. Use `imgLoadFunc` prop instead.")
        }
        if (this.size) {
          this.$logger.warn("'size' is deprecated. Use `imgSize` prop instead.")
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
          projection: this.projection,
          // ol/source/ImageStatic
          crossOrigin: this.crossOrigin,
          imageExtent: this.resolvedImgExtent,
          imageLoadFunction: this.resolvedImgLoadFunc,
          imageSize: this.resolvedImgSize,
          url: this.url,
        })
      },
    },
  }
</script>
