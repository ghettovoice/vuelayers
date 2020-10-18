<script>
  import { Stroke as StrokeStyle } from 'ol/style'
  import { style } from '../../mixins'
  import { normalizeColor } from '../../ol-ext'
  import { isEqual } from '../../utils'
  import sequential from '../../utils/sequential'

  export default {
    name: 'VlStyleStroke',
    mixins: [
      style,
    ],
    props: {
      color: {
        type: [Array, String],
        default: '#3399cc',
      },
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
    },
    computed: {
      parsedColor () {
        return normalizeColor(this.color)
      },
    },
    watch: {
      color: /*#__PURE__*/sequential(async function (value) {
        await this.setColor(value)
      }),
      lineCap: /*#__PURE__*/sequential(async function (value) {
        await this.setLineCap(value)
      }),
      lineJoin: /*#__PURE__*/sequential(async function (value) {
        await this.setLineJoin(value)
      }),
      lineDash: /*#__PURE__*/sequential(async function (value) {
        await this.setLineDash(value)
      }),
      lineDashOffset: /*#__PURE__*/sequential(async function (value) {
        await this.setLineDashOffset(value)
      }),
      miterLimit: /*#__PURE__*/sequential(async function (value) {
        await this.setMiterLimit(value)
      }),
      width: /*#__PURE__*/sequential(async function (value) {
        await this.setWidth(value)
      }),
    },
    created () {
      this::defineServices()
    },
    methods: {
      /**
       * @return {StrokeStyle}
       * @protected
       */
      createStyle () {
        return new StrokeStyle({
          color: this.parsedColor,
          lineCap: this.lineCap,
          lineJoin: this.lineJoin,
          lineDash: this.lineDash,
          lineDashOffset: this.lineDashOffset,
          miterLimit: this.miterLimit,
          width: this.width,
        })
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async mount () {
        if (this.$strokeStyleContainer) {
          await this.$strokeStyleContainer.setStroke(this)
        }

        return this::style.methods.mount()
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async unmount () {
        if (this.$strokeStyleContainer && this.$strokeStyleContainer.getStrokeVm() === this) {
          await this.$strokeStyleContainer.setStroke(null)
        }

        return this::style.methods.unmount()
      },
      /**
       * @return {Promise}
       */
      async refresh () {
        this::style.methods.refresh()

        if (this.$strokeStyleContainer) {
          this.$strokeStyleContainer.refresh()
        }
      },
      async getColor () {
        return (await this.resolveStyle()).getColor()
      },
      async setColor (color) {
        color = normalizeColor(color)
        if (isEqual(color, await this.getColor())) return

        (await this.resolveStyle()).setColor(color)
        await this.scheduleRefresh()
      },
      async getLineCap () {
        return (await this.resolveStyle()).getLineCap()
      },
      async setLineCap (lineCap) {
        if (lineCap === await this.getLineCap()) return

        (await this.resolveStyle()).setLineCap(lineCap)
        await this.scheduleRefresh()
      },
      async getLineJoin () {
        return (await this.resolveStyle()).getLineJoin()
      },
      async setLineJoin (lineJoin) {
        if (lineJoin === await this.getLineJoin()) return

        (await this.resolveStyle()).setLineJoin(lineJoin)
        await this.scheduleRefresh()
      },
      async getLineDash () {
        return (await this.resolveStyle()).getLineDash()
      },
      async setLineDash (lineDash) {
        if (isEqual(lineDash, await this.getLineDash())) return

        (await this.resolveStyle()).setLineDash(lineDash)
        await this.scheduleRefresh()
      },
      async getLineDashOffset () {
        return (await this.resolveStyle()).getLineDashOffset()
      },
      async setLineDashOffset (lineDashOffset) {
        if (lineDashOffset === await this.getLineDashOffset()) return

        (await this.resolveStyle()).setLineDashOffset(lineDashOffset)
        await this.scheduleRefresh()
      },
      async getMiterLimit () {
        return (await this.resolveStyle()).getMiterLimit()
      },
      async setMiterLimit (miterLimit) {
        if (miterLimit === await this.getMiterLimit()) return

        (await this.resolveStyle()).setMiterLimit(miterLimit)
        await this.scheduleRefresh()
      },
      async getWidth () {
        return (await this.resolveStyle()).getWidth()
      },
      async setWidth (width) {
        if (width === await this.getWidth()) return

        (await this.resolveStyle()).setWidth(width)
        await this.scheduleRefresh()
      },
    },
  }

  function defineServices () {
    Object.defineProperties(this, {
      $strokeStyleContainer: {
        enumerable: true,
        get: () => this.$services?.strokeStyleContainer,
      },
    })
  }
</script>
