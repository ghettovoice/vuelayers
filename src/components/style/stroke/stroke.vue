<script>
  import Stroke from 'ol/style/stroke'
  import style from 'vl-components/style/style'

  const props = {
    color: [ Array, String ],
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
      default: 1.25
    }
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
        width: this.width
      })
    },
    /**
     * @protected
     */
    mountStyle () {
      this.setStroke(this.style)
    },
    /**
     * @protected
     */
    unmountStyle () {
      this.setStroke(undefined)
    }
  }

  const watch = {
    color (value) {
      this.style.setColor(value)
      this.refresh()
    },
    lineCap (value) {
      this.style.setLineCap(value)
      this.refresh()
    },
    lineDash (value) {
      this.style.setLineDash(value)
      this.refresh()
    },
    lineJoin (value) {
      this.style.setLineJoin(value)
      this.refresh()
    },
    width (value) {
      this.style.setWidth(value)
      this.refresh()
    }
    // todo добавить остальный вотчеры
  }

  export default {
    name: 'vl-style-stroke',
    mixins: [ style ],
    inject: style.inject.concat([ 'setStroke' ]),
    props,
    watch,
    methods
  }
</script>
