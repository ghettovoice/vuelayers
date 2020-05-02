<script>
  import { Fill as FillStyle } from 'ol/style'
  import { style } from '../../mixin'
  import { normalizeColor } from '../../ol-ext'
  import { isEqual } from '../../util/minilo'

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
    computed: {
      parsedColor () {
        return normalizeColor(this.color)
      },
    },
    watch: {
      async color (value) {
        await this.setColor(value)
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
          color: this.parsedColor,
        })
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async mount () {
        if (this.$fillStyleContainer) {
          await this.$fillStyleContainer.setFill(this)
        }

        return this::style.methods.mount()
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async unmount () {
        if (this.$fillStyleContainer) {
          await this.$fillStyleContainer.setFill(undefined)
        }

        return this::style.methods.unmount()
      },
      async getColor () {
        return normalizeColor((await this.resolveStyle()).getColor())
      },
      async setColor (color) {
        color = normalizeColor(color)

        if (isEqual(color, await this.getColor())) return

        (await this.resolveStyle()).setColor(color)

        await this.scheduleRemount()
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
