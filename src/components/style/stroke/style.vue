<script>
  import Stroke from 'ol/style/stroke'
  import style from '../style'

  const props = {
    color: [Array, String],
    lineCap: {
      type: String,
      default: 'round' // round, butt, square
    },
    lineJoin: {
      type: String,
      default: 'round' // round, bevel, miter
    },
    lineDash: Array,
    lineDashOffset: {
      type: Number,
      default: 0
    },
    miterLimit: {
      type: Number,
      default: 10
    },
    width: {
      type: Number,
      default: 1.25
    }
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
        width: this.width
      })
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this.$parent.setStroke(this)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.$parent.setStroke(undefined)
    }
  }

  const watch = {
    color (value) {
      if (!this.style) return

      this.style.setColor(value)
      this.requestRefresh()
    },
    lineCap (value) {
      if (!this.style) return

      this.style.setLineCap(value)
      this.requestRefresh()
    },
    lineDash (value) {
      if (!this.style) return

      this.style.setLineDash(value)
      this.requestRefresh()
    },
    lineJoin (value) {
      if (!this.style) return

      this.style.setLineJoin(value)
      this.requestRefresh()
    },
    width (value) {
      if (!this.style) return

      this.style.setWidth(value)
      this.requestRefresh()
    }
  }

  export default {
    name: 'vl-style-stroke',
    mixins: [style],
    props,
    watch,
    methods
  }
</script>
