<script>
  import { Stroke as StrokeStyle } from 'ol/style'
  import { style } from '../../mixins'
  import { normalizeColor } from '../../ol-ext'
  import { clonePlainObject, coalesce, isEqual, isObjectLike, lowerFirst, makeWatchers, upperFirst } from '../../utils'

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
    data () {
      return {
        currentColor: normalizeColor(this.color),
        currentLineCap: this.lineCap,
        currentLineJoin: this.lineJoin,
        currentLineDash: this.lineDash?.slice(),
        currentLineDashOffset: this.lineDashOffset,
        currentMiterLimit: this.miterLimit,
        currentWidth: this.width,
      }
    },
    computed: {
      inputColor () {
        return normalizeColor(this.color)
      },
      inputLineDash () {
        return this.lineDash?.slice()
      },
    },
    watch: {
      rev () {
        if (!this.$style) return

        this.setColor(this.getColor())
        this.setLineCap(this.getLineCap())
        this.setLineJoin(this.getLineJoin())
        this.setLineDash(this.getLineDash())
        this.setLineDashOffset(this.getLineDashOffset())
        this.setMiterLimit(this.getMiterLimit())
        this.setWidth(this.getWidth())
      },
      .../*#__PURE__*/makeWatchers([
        'inputColor',
        'lineCap',
        'lineJoin',
        'inputLineDash',
        'lineDashOffset',
        'miterLimit',
        'width',
      ], inProp => {
        const prop = inProp.slice(0, 5) === 'input' ? lowerFirst(inProp.slice(5)) : inProp
        const setter = 'set' + upperFirst(prop)

        return {
          deep: [
            'inputColor',
            'inputLineDash',
          ].includes(inProp),
          handler (value) {
            this[setter](value)
          },
        }
      }),
      .../*#__PURE__*/makeWatchers([
        'currentColor',
        'currentLineCap',
        'currentLineJoin',
        'currentLineDash',
        'currentLineDashOffset',
        'currentMiterLimit',
        'currentWidth',
      ], curProp => {
        const prop = curProp.slice(0, 7) === 'current' ? lowerFirst(curProp.slice(7)) : curProp
        const inProp = 'input' + upperFirst(prop)

        return {
          deep: [
            'currentColor',
            'currentLineDash',
          ].includes(curProp),
          handler (value) {
            if (isEqual(value, coalesce(this[inProp], this[prop]))) return

            this.$emit(`update:${prop}`, isObjectLike(value) ? clonePlainObject(value) : value)
          },
        }
      }),
      inputColor: {
        deep: true,
        handler (value) {
          this.setColor(value)
        },
      },
      currentColor: {
        deep: true,
        handler (value) {
          if (isEqual(value, this.inputColor)) return

          this.$emit('update:color', value?.slice())
        },
      },
      lineCap (value) {
        this.setLineCap(value)
      },
      currentLineCap (value) {
        if (value === this.lineCap) return

        this.$emit('update:lineCap', value)
      },
      lineJoin (value) {
        this.setLineJoin(value)
      },
      currentLineJoin (value) {
        if (value === this.lineJoin) return

        this.$emit('update:lineJoin', value)
      },
      inputLineDash: {
        deep: true,
        handler (value) {
          this.setLineDash(value)
        },
      },
      currentLineDash: {
        deep: true,
        handler (value) {
          if (isEqual(value, this.currentLineDash)) return

          this.$emit('update:lineDash', value?.slice())
        },
      },
      lineDashOffset (value) {
        this.setLineDashOffset(value)
      },
      currentLineDashOffset (value) {
        if (value === this.lineDashOffset) return

        this.$emit('update:lineDashOffset', value)
      },
      miterLimit (value) {
        this.setMiterLimit(value)
      },
      currentMiterLimit (value) {
        if (value === this.miterLimit) return

        this.$emit('update:miterLimit', value)
      },
      width (value) {
        this.setWidth(value)
      },
      currentWidth (value) {
        if (value === this.width) return

        this.$emit('update:width', value)
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
          color: this.currentColor,
          lineCap: this.currentLineCap,
          lineJoin: this.currentLineJoin,
          lineDash: this.currentLineDash,
          lineDashOffset: this.currentLineDashOffset,
          miterLimit: this.currentMiterLimit,
          width: this.currentWidth,
        })
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async mount () {
        this.$strokeStyleContainer?.setStroke(this)

        return this::style.methods.mount()
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async unmount () {
        if (this.$strokeStyleContainer?.getStrokeVm() === this) {
          this.$strokeStyleContainer.setStroke(null)
        }

        return this::style.methods.unmount()
      },
      /**
       * @return {Promise}
       */
      async refresh () {
        await Promise.all([
          this::style.methods.refresh(),
          this.$strokeStyleContainer?.refresh(),
        ])
      },
      /**
       * @protected
       */
      syncNonObservable () {
        this::style.methods.syncNonObservable()

        this.setColor(this.getColor())
        this.setLineCap(this.getLineCap())
        this.setLineJoin(this.getLineJoin())
        this.setLineDash(this.getLineDash())
        this.setLineDashOffset(this.getLineDashOffset())
        this.setMiterLimit(this.getMiterLimit())
        this.setWidth(this.getWidth())
      },
      getColor () {
        return coalesce(this.$style?.getColor(), this.currentColor)
      },
      setColor (color) {
        color = normalizeColor(color)

        if (!isEqual(color, this.currentColor)) {
          this.currentColor = color
          this.scheduleRefresh()
        }
        if (this.$style && !isEqual(color, this.$style.getColor())) {
          this.$style.setColor(color)
          this.scheduleRefresh()
        }
      },
      getLineCap () {
        return coalesce(this.$style?.getLineCap(), this.currentLineCap)
      },
      setLineCap (lineCap) {
        if (lineCap !== this.currentLineCap) {
          this.currentLineCap = lineCap
          this.scheduleRefresh()
        }
        if (this.$style && lineCap !== this.$style.getLineCap()) {
          this.$style.setLineCap(lineCap)
          this.scheduleRefresh()
        }
      },
      getLineJoin () {
        return coalesce(this.$style?.getLineJoin(), this.currentLineJoin)
      },
      setLineJoin (lineJoin) {
        if (lineJoin !== this.currentLineJoin) {
          this.currentLineJoin = lineJoin
        }
        if (this.$style && lineJoin !== this.$style.getLineJoin()) {
          this.$style.setLineJoin(lineJoin)
          this.scheduleRefresh()
        }
      },
      getLineDash () {
        return coalesce(this.$style?.getLineDash(), this.currentLineDash)
      },
      setLineDash (lineDash) {
        lineDash = lineDash?.slice()

        if (!isEqual(lineDash, this.currentLineDash)) {
          this.currentLineDash = lineDash
          this.scheduleRefresh()
        }
        if (this.$style && !isEqual(lineDash, this.$style.getLineDash())) {
          this.$style.setLineDash(lineDash)
          this.scheduleRefresh()
        }
      },
      getLineDashOffset () {
        return coalesce(this.$style?.getLineDashOffset(), this.currentLineDashOffset)
      },
      setLineDashOffset (lineDashOffset) {
        if (lineDashOffset !== this.currentLineDashOffset) {
          this.currentLineDashOffset = lineDashOffset
          this.scheduleRefresh()
        }
        if (this.$style && lineDashOffset !== this.$style.getLineDashOffset()) {
          this.$style.setLineDashOffset(lineDashOffset)
          this.scheduleRefresh()
        }
      },
      getMiterLimit () {
        return coalesce(this.$style?.getMiterLimit(), this.currentMiterLimit)
      },
      setMiterLimit (miterLimit) {
        if (miterLimit !== this.currentMiterLimit) {
          this.currentMiterLimit = miterLimit
          this.scheduleRefresh()
        }
        if (this.$style && miterLimit !== this.$style.getMiterLimit()) {
          this.$style.setMiterLimit(miterLimit)
          this.scheduleRefresh()
        }
      },
      getWidth () {
        return coalesce(this.$style?.getWidth(), this.currentWidth)
      },
      setWidth (width) {
        if (width !== this.currentWidth) {
          this.currentWidth = width
          this.scheduleRefresh()
        }
        if (this.$style && width !== this.$style.getWidth()) {
          this.$style.setWidth(width)
          this.scheduleRefresh()
        }
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
