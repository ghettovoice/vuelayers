<script>
  import Stroke from 'ol/style/stroke'
  import style from '../style'
  import { assertHasStyleTarget } from '../../../utils/assert'

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
    lineDashOffset: Number,
    miterLimit: Number,
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
      assertHasStyleTarget(this)
      this.styleTarget.setStroke(this.style)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      assertHasStyleTarget(this)
      this.styleTarget.setStroke(undefined)
    }
  }

  const watch = {
    color (value) {
      this.style.setColor(value)
      this.deferRefresh()
    },
    lineCap (value) {
      this.style.setLineCap(value)
      this.deferRefresh()
    },
    lineDash (value) {
      this.style.setLineDash(value)
      this.deferRefresh()
    },
    lineJoin (value) {
      this.style.setLineJoin(value)
      this.deferRefresh()
    },
    width (value) {
      this.style.setWidth(value)
      this.deferRefresh()
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
