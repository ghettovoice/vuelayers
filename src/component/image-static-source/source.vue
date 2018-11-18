<script>
  import ImageStaticSource from 'ol/source/ImageStatic'
  import imageSource from '../../mixin/image-source'
  import withUrl from '../../mixin/with-url'
  import { makeWatchers } from '../../util/vue-helpers'

  /**
   * @vueProps
   */
  const props = /** @lends module:image-static-source/source# */{
    /**
     * Image extent in the source projection.
     * @type {number[]}
     */
    extent: {
      type: Array,
      required: true,
      validator: value => value.length === 4,
    },
    /**
     * Optional function to load an image given a URL.
     * @type {function|undefined}
     */
    loadFunc: Function,
    /**
     * Image size in pixels.
     * @type {number[]}
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
      validator: value => !!value.length,
    },
  }

  /**
   * @vueMethods
   */
  const methods = /** @lends module:image-static-source/source# */{
    /**
     * @return {ImageStatic}
     * @protected
     */
    createSource () {
      return new ImageStaticSource({
        attributions: this.attributions,
        crossOrigin: this.crossOrigin,
        imageExtent: this.extent,
        imageLoadFunction: this.loadFunc,
        logo: this.logo,
        projection: this.projection,
        imageSize: this.size,
        url: this.urlTmpl,
      })
    },
  }

  const watch = makeWatchers(Object.keys(props), () => function () {
    this.scheduleRecreate()
  })

  /**
   * A layer source for displaying a single, static image.
   *
   * @vueProto
   * @title vl-source-image-static
   * @alias module:image-static-source/source
   */
  export default {
    name: 'vl-source-image-static',
    mixins: [imageSource, withUrl],
    props,
    methods,
    watch,
  }
</script>
