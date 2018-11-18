<script>
  import Stroke from 'ol/style/Stroke'
  import style from '../../mixin/style'
  import { isEqual } from '../../util/minilo'

  const props = {
    color: [Array, String],
    lineCap: {
      type: String,
      default: 'round', // round, butt, square
    },
    lineJoin: {
      type: String,
      default: 'round', // round, bevel, miter
    },
    lineDash: Array,
    lineDashOffset: {
      type: Number,
      default: 0,
    },
    miterLimit: {
      type: Number,
      default: 10,
    },
    width: {
      type: Number,
      default: 1.25,
    },
  }

  const methods = {
    /**
     * @return {Stroke}
     * @protected
     */
    createStyle () {
      return new Stroke({
        color: this.color,
        lineCap: this.lineCap,
        lineJoin: this.lineJoin,
        lineDash: this.lineDash,
        lineDashOffset: this.lineDashOffset,
        miterLimit: this.miterLimit,
        width: this.width,
      })
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this.$stylesContainer && this.$stylesContainer.setStroke(this)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.$stylesContainer && this.$stylesContainer.setStroke(undefined)
    },
  }

  const watch = {
    color (value) {
      if (this.$style && !isEqual(value, this.$style.getColor())) {
        this.$style.setColor(value)
        this.scheduleRefresh()
      }
    },
    lineCap (value) {
      if (this.$style && !isEqual(value, this.$style.getLineCap())) {
        this.$style.setLineCap(value)
        this.scheduleRefresh()
      }
    },
    lineDash (value) {
      if (this.$style && !isEqual(value, this.$style.getLineDash())) {
        this.$style.setLineDash(value)
        this.scheduleRefresh()
      }
    },
    lineJoin (value) {
      if (this.$style && !isEqual(value, this.$style.getLineJoin())) {
        this.$style.setLineJoin(value)
        this.scheduleRefresh()
      }
    },
    width (value) {
      if (this.$style && !isEqual(value, this.$style.getWidth())) {
        this.$style.setWidth(value)
        this.scheduleRefresh()
      }
    },
  }

  export default {
    name: 'vl-style-stroke',
    mixins: [style],
    props,
    watch,
    methods,
  }
</script>
