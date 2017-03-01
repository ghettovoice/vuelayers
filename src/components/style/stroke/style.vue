<script>
  import ol from 'openlayers'
  import style from 'vuelayers/src/mixins/style'

  const props = {
    color: {
      type: [ Array, String ],
      default: null
    },
    lineCap: {
      type: String,
      default: 'round' // round, butt, square
    },
    lineJoin: {
      type: String,
      default: 'round' // round, bevel, miter
    },
    lineDash: Array,
    lineDashOffset: Number,
    miterLimit: Number,
    width: {
      type: Number,
      default: 1
    }
  }

  const methods = {
    /**
     * @return {ol.style.Stroke}
     * @protected
     */
    createStyle () {
      return new ol.style.Stroke({
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
     * @protected
     */
    append () {
      this.styleTarget && this.styleTarget.setStroke(this.style)
    },
    /**
     * @protected
     */
    remove () {
      this.styleTarget && this.styleTarget.setStroke(undefined)
    }
  }

  const watch = {
    color (value) {
      this.style.setColor(value)
    },
    lineCap (value) {
      this.style.setLineCap(value)
    },
    lineDash (value) {
      this.style.setLineDash(value)
    },
    lineJoin (value) {
      this.style.setLineJoin(value)
    },
    width (value) {
      this.style.setWidth(value)
    }
    // todo добавить остальный вотчеры
  }

  export default {
    name: 'vl-style-stroke',
    mixins: [ style ],
    props,
    watch,
    methods
  }
</script>

<style>/* stub styles */</style>
