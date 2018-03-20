<script>
  /**
   * @module fill-style/style
   */
  import Fill from 'ol/style/fill'
  import style from '../../mixin/style'

  const props = {
    color: [String, Array],
  }

  const methods = {
    /**
     * @return {ol.style.Fill}
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
      if (!this.$style) return

      this.$style.setColor(value)
      this.refresh()
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
