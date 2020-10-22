<script>
  import { Fill as FillStyle } from 'ol/style'
  import { style } from '../../mixins'
  import { normalizeColor } from '../../ol-ext'
  import { coalesce, isEqual } from '../../utils'

  export default {
    name: 'VlStyleFill',
    mixins: [
      style,
    ],
    props: {
      color: {
        type: [String, Array],
        default: () => [255, 255, 255, 0.4],
      },
    },
    data () {
      return {
        currentColor: normalizeColor(this.color),
      }
    },
    computed: {
      inputColor () {
        return normalizeColor(this.color)
      },
    },
    watch: {
      rev () {
        if (!this.$style) return

        this.setColor(this.getColor())
      },
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
    },
    created () {
      this::defineServices()
    },
    methods: {
      /**
       * @return {FillStyle}
       * @protected
       */
      createStyle () {
        return new FillStyle({
          color: this.currentColor,
        })
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async mount () {
        this.$fillStyleContainer?.setFill(this)

        return this::style.methods.mount()
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async unmount () {
        if (this.$fillStyleContainer?.getFillVm() === this) {
          this.$fillStyleContainer.setFill(null)
        }

        return this::style.methods.unmount()
      },
      /**
       * @return {Promise<void>}
       */
      async refresh () {
        await Promise.all([
          this::style.methods.refresh(),
          this.$fillStyleContainer?.refresh(),
        ])
      },
      /**
       * @protected
       */
      syncNonObservable () {
        this::style.methods.syncNonObservable()

        this.setColor(this.getColor())
      },
      getColor () {
        return normalizeColor(coalesce(this.$style?.getColor(), this.currentColor))
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
    },
  }

  function defineServices () {
    Object.defineProperties(this, {
      $fillStyleContainer: {
        enumerable: true,
        get: () => this.$services?.fillStyleContainer,
      },
    })
  }
</script>
