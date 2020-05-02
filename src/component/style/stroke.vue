<script>
  import { Stroke as StrokeStyle } from 'ol/style'
  import { style } from '../../mixin'
  import { normalizeColor } from '../../ol-ext'
  import { isEqual } from '../../util/minilo'

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
      async color (value) {
        await this.setColor(value)
      },
      async lineCap (value) {
        await this.setLineCap(value)
      },
      async lineJoin (value) {
        await this.setLineJoin(value)
      },
      async lineDash (value) {
        await this.setLineDash(value)
      },
      async lineDashOffset (value) {
        await this.setLineDashOffset(value)
      },
      async miterLimit (value) {
        await this.setMiterLimit(value)
      },
      async width (value) {
        await this.setWidth(value)
      },
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
        if (this.$strokeStyleContainer) {
          await this.$strokeStyleContainer.setStroke(undefined)
        }

        return this::style.methods.unmount()
      },
      async getColor () {
        return (await this.resolveStyle()).getColor()
      },
      async setColor (color) {
        const style = await this.resolveStyle()
        color = normalizeColor(color)

        if (isEqual(color, style.getColor())) return

        style.setColor(color)

        await this.scheduleRemount()
      },
      async getLineCap () {
        return (await this.resolveStyle()).getLineCap()
      },
      async setLineCap (lineCap) {
        const style = await this.resolveStyle()

        if (lineCap === style.getLineCap()) return

        style.setLineCap(lineCap)

        await this.scheduleRemount()
      },
      async getLineJoin () {
        return (await this.resolveStyle()).getLineJoin()
      },
      async setLineJoin (lineJoin) {
        const style = await this.resolveStyle()

        if (lineJoin === style.getLineJoin()) return

        style.setLineJoin(lineJoin)

        await this.scheduleRemount()
      },
      async getLineDash () {
        return (await this.resolveStyle()).getLineDash()
      },
      async setLineDash (lineDash) {
        const style = await this.resolveStyle()

        if (isEqual(lineDash, style.getLineDash())) return

        style.setLineDash(lineDash)

        await this.scheduleRemount()
      },
      async getLineDashOffset () {
        return (await this.resolveStyle()).getLineDashOffset()
      },
      async setLineDashOffset (lineDashOffset) {
        const style = await this.resolveStyle()

        if (lineDashOffset === style.getLineDashOffset()) return

        style.setLineDashOffset(lineDashOffset)

        await this.scheduleRemount()
      },
      async getMiterLimit () {
        return (await this.resolveStyle()).getMiterLimit()
      },
      async setMiterLimit (miterLimit) {
        const style = await this.resolveStyle()

        if (miterLimit === style.getMiterLimit()) return

        style.setMiterLimit(miterLimit)

        await this.scheduleRemount()
      },
      async getWidth () {
        return (await this.resolveStyle()).getWidth()
      },
      async setWidth (width) {
        const style = await this.resolveStyle()

        if (width === style.getWidth()) return

        style.setWidth(width)

        await this.scheduleRemount()
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
