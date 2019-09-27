<script>
  import Icon from 'ol/style/Icon'
  import { imageStyle } from '../../mixin'
  import { assert } from '../../util/assert'
  import { arrayLengthValidator, isEmpty, isEqual } from '../../util/minilo'
  import { makeWatchers } from '../../util/vue-helpers'

  export default {
    name: 'vl-style-icon',
    mixins: [imageStyle],
    props: {
      src: String,
      size: {
        type: Array,
        validator: arrayLengthValidator(2),
      },
      img: Image,
      imgSize: {
        type: Array,
        validator: arrayLengthValidator(2),
      },
      anchor: {
        type: Array,
        default: () => [0.5, 0.5],
        validator: arrayLengthValidator(2),
      },
      anchorOrigin: {
        type: String,
        default: 'top-left', // bottom-left, bottom-right, top-left or top-right
      },
      anchorXUnits: {
        type: String,
        default: 'fraction', // pixels, fraction
      },
      anchorYUnits: {
        type: String,
        default: 'fraction', // pixels, fraction
      },
      color: [Array, String],
      crossOrigin: String,
      offset: {
        type: Array,
        default: () => [0, 0],
        validator: arrayLengthValidator(2),
      },
      offsetOrigin: {
        type: String,
        default: 'top-left', // bottom-left, bottom-right, top-left or top-right
      },
      opacity: {
        type: Number,
        default: 1,
      },
      scale: {
        type: Number,
        default: 1,
      },
      rotateWithView: {
        type: Boolean,
        default: false,
      },
      rotation: {
        type: Number,
        default: 0,
      },
    },
    methods: {
      /**
       * @return {Icon}
       * @protected
       */
      createStyle () {
        assert((this.src && !this.img) || (!this.src && this.img), `vl-style-icon one of 'image' or 'src' prop must be provided.`)
        assert(!this.img || (this.img && !isEmpty(this.imgSize)), `vl-style-icon 'imgSize' must be set when image is provided.`)

        return new Icon({
          anchor: this.anchor,
          anchorOrigin: this.anchorOrigin,
          anchorXUnits: this.anchorXUnits,
          anchorYUnits: this.anchorYUnits,
          color: this.color,
          crossOrigin: this.crossOrigin,
          offset: this.offset,
          offsetOrigin: this.offsetOrigin,
          opacity: this.opacity,
          scale: this.scale,
          rotateWithView: this.rotateWithView,
          rotation: this.rotation,
          size: this.size,
          src: this.src,
          img: this.img,
          imgSize: this.imgSize,
        })
      },
    },
    watch: {
      src (value) {
        if (this.$style && !isEqual(value, this.$style.getSrc())) {
          this.scheduleRefresh()
        }
      },
      size (value) {
        if (this.$style && !isEqual(value, this.$style.getSize())) {
          this.scheduleRefresh()
        }
      },
      anchor (value) {
        if (this.$style && !isEqual(value, this.$style.getAnchor())) {
          this.scheduleRefresh()
        }
      },
      color (value) {
        if (this.$style && !isEqual(value, this.$style.getColor())) {
          this.scheduleRefresh()
        }
      },
      opacity (value) {
        if (this.$style && !isEqual(value, this.$style.getOpacity())) {
          this.scheduleRefresh()
        }
      },
      scale (value) {
        if (this.$style && !isEqual(value, this.$style.getScale())) {
          this.scheduleRefresh()
        }
      },
      rotateWithView (value) {
        if (this.$style && !isEqual(value, this.$style.getRotateWithView())) {
          this.scheduleRefresh()
        }
      },
      rotation (value) {
        if (this.$style && !isEqual(value, this.$style.getRotation())) {
          this.scheduleRefresh()
        }
      },
      ...makeWatchers([
        'anchorOrigin',
        'anchorXUnits',
        'anchorYUnits',
        'crossOrigin',
        'offset',
        'offsetOrigin',
        'img',
        'imgSize',
      ], () => function () {
        this.scheduleRefresh()
      }),
    },
  }
</script>
