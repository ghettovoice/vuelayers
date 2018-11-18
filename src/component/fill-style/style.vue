<script>
  import Fill from 'ol/style/Fill'
  import style from '../../mixin/style'
  import { isEqual } from '../../util/minilo'

  const props = {
    color: [String, Array],
  }

  const methods = {
    /**
     * @return {Fill}
     * @protected
     */
    createStyle () {
      return new Fill({
        color: this.color,
      })
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this.$stylesContainer && this.$stylesContainer.setFill(this)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.$stylesContainer && this.$stylesContainer.setFill(undefined)
    },
  }

  const watch = {
    color (value) {
      if (this.$style && !isEqual(value, this.$style.getColor())) {
        this.$style.setColor(value)
        this.scheduleRefresh()
      }
    },
  }

  export default {
    name: 'vl-style-fill',
    mixins: [style],
    props,
    methods,
    watch,
  }
</script>
