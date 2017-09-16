<script>
  import Stroke from 'ol/style/stroke'
  import { style } from '../../core'

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
     * @return {ol.style.Stroke}
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
      if (!this.$style) return

      this.$style.setColor(value)
      this.refresh()
    },
    lineCap (value) {
      if (!this.$style) return

      this.$style.setLineCap(value)
      this.refresh()
    },
    lineDash (value) {
      if (!this.$style) return

      this.$style.setLineDash(value)
      this.refresh()
    },
    lineJoin (value) {
      if (!this.$style) return

      this.$style.setLineJoin(value)
      this.refresh()
    },
    width (value) {
      if (!this.$style) return

      this.$style.setWidth(value)
      this.refresh()
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
