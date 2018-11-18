<script>
  import Icon from 'ol/style/Icon'
  import imageStyle from '../../mixin/image-style'
  import { isEqual } from '../../util/minilo'

  const props = {
    src: {
      type: String,
      required: true,
    },
    size: {
      type: Array,
      validator: value => value.length === 2,
    },
    anchor: {
      type: Array,
      default: () => [0.5, 0.5],
      validator: value => value.length === 2,
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
      validator: value => value.length === 2,
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
  }

  const methods = {
    /**
     * @return {Icon}
     * @protected
     */
    createStyle () {
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
      })
    },
  }
  // todo other watchers
  const watch = {
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
    scale (value) {
      if (this.$style && !isEqual(value, this.$style.getScale())) {
        this.scheduleRefresh()
      }
    },
  }

  export default {
    name: 'vl-style-icon',
    mixins: [imageStyle],
    props,
    methods,
    watch,
  }
</script>
