<script>
  import { Icon as IconStyle } from 'ol/style'
  import IconAnchorUnits from 'ol/style/IconAnchorUnits'
  import IconOrigin from 'ol/style/IconOrigin'
  import { imageStyle, makeChangeOrRecreateWatchers } from '../../mixins'
  import { normalizeColor } from '../../ol-ext'
  import { assert, coalesce, isEmpty, isEqual, round } from '../../utils'

  export default {
    name: 'VlStyleIcon',
    mixins: [
      imageStyle,
    ],
    props: {
      src: String,
      size: {
        type: Array,
        validator: val => val.length === 2,
      },
      img: Image,
      imgSize: {
        type: Array,
        validator: val => val.length === 2,
      },
      anchor: {
        type: Array,
        default: () => [0.5, 0.5],
        validator: val => val.length === 2,
      },
      anchorOrigin: {
        type: String,
        default: IconOrigin.TOP_LEFT, // bottom-left, bottom-right, top-left or top-right
      },
      anchorXUnits: {
        type: String,
        default: IconAnchorUnits.FRACTION, // pixels, fraction
      },
      anchorYUnits: {
        type: String,
        default: IconAnchorUnits.FRACTION, // pixels, fraction
      },
      color: [Array, String],
      crossOrigin: String,
      offset: {
        type: Array,
        default: () => [0, 0],
        validator: val => val.length === 2,
      },
      offsetOrigin: {
        type: String,
        default: IconOrigin.TOP_LEFT, // bottom-left, bottom-right, top-left or top-right
      },
    },
    data () {
      return {
        currentAnchor: this.anchor?.slice(),
      }
    },
    computed: {
      inputSize () {
        return this.size?.slice()
      },
      inputImgSize () {
        return this.imgSize?.slice()
      },
      inputAnchor () {
        return this.anchor?.slice()
      },
      inputColor () {
        return this.color ? normalizeColor(this.color) : undefined
      },
      inputOffset () {
        return this.offset?.slice()
      },
    },
    watch: {
      rev () {
        if (!this.$style) return

        this.setAnchor(this.getAnchor())
      },
      inputAnchor: {
        deep: true,
        handler (value) {
          this.setAnchor(value)
        },
      },
      currentAnchor: {
        deep: true,
        handler (value) {
          if (isEqual(value, this.inputAnchor)) return

          this.$emit('update:anchor', value?.slice())
        },
      },
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'src',
        'inputSize',
        'img',
        'inputImgSize',
        'anchorOrigin',
        'anchorXUnits',
        'anchorYUnits',
        'anchorYUnits',
        'inputColor',
        'crossOrigin',
        'inputOffset',
        'offsetOrigin',
      ], [
        'inputSize',
        'inputImgSize',
        'inputColor',
        'inputOffset',
      ]),
    },
    methods: {
      /**
       * @return {Icon}
       * @protected
       */
      createStyle () {
        assert(
          (this.src && !this.img) || (!this.src && this.img),
          "vl-style-icon one of 'image' or 'src' prop must be provided.'",
        )
        assert(
          !this.img || (this.img && !isEmpty(this.imgSize)),
          "vl-style-icon 'imgSize' must be set when image is provided.",
        )

        return new IconStyle({
          // ol/style/Image
          opacity: this.currentOpacity,
          scale: this.currentScale,
          rotateWithView: this.currentRotateWithView,
          rotation: this.currentRotation,
          displacement: this.inputDisplacement,
          // ol/style/Icon
          anchor: this.currentAnchor,
          anchorOrigin: this.anchorOrigin,
          anchorXUnits: this.anchorXUnits,
          anchorYUnits: this.anchorYUnits,
          color: this.inputColor,
          crossOrigin: this.crossOrigin,
          offset: this.inputOffset,
          offsetOrigin: this.offsetOrigin,
          size: this.inputSize,
          src: this.src,
          img: this.img,
          imgSize: this.inputImgSize,
        })
      },
      /**
       * @protected
       */
      syncNonObservable () {
        this::imageStyle.methods.syncNonObservable()

        this.setAnchor(this.getAnchor())
      },
      getAnchor () {
        const anchor = this.$style?.getAnchor()?.slice()
        if (!anchor) return this.currentAnchor

        const size = this.getSize()
        if (!size) return

        if (this.anchorXUnits === IconAnchorUnits.FRACTION) {
          anchor[0] /= size[0]
        }
        if (this.anchorYUnits === IconAnchorUnits.FRACTION) {
          anchor[1] /= size[1]
        }
        if ([IconOrigin.TOP_RIGHT, IconOrigin.BOTTOM_RIGHT].includes(this.anchorOrigin)) {
          anchor[0] = 1 - anchor[0]
        }
        if ([IconOrigin.BOTTOM_LEFT, IconOrigin.BOTTOM_RIGHT].includes(this.anchorOrigin)) {
          anchor[1] = 1 - anchor[1]
        }
        anchor[0] = round(anchor[0], 3)
        anchor[1] = round(anchor[1], 3)

        return anchor
      },
      setAnchor (anchor) {
        anchor = anchor?.slice()

        if (!isEqual(anchor, this.currentAnchor)) {
          this.currentAnchor = anchor
          this.scheduleRefresh()
        }
        if (this.$style && !isEqual(anchor, this.$style.getAnchor())) {
          this.$style.setAnchor(anchor)
          this.scheduleRefresh()
        }
      },
      getColor () {
        return coalesce(this.$style?.getColor(), this.inputColor)
      },
      getImage (pixelRatio) {
        return this.$style?.getImage(pixelRatio)
      },
      getPixelRatio (pixelRatio) {
        return this.$style?.getPixelRatio(pixelRatio)
      },
      getOrigin () {
        return this.$style?.getOrigin()
      },
      getSize () {
        return coalesce(this.$style?.getSize(), this.inputSize)
      },
      getSrc () {
        return coalesce(this.$style?.getSrc(), this.src)
      },
      async load () {
        (await this.resolveStyle()).load()
      },
    },
  }
</script>
