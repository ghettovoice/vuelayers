<script>
  import Fill from 'ol/style/fill'
  import style from '../style'

  const props = {
    color: [String, Array]
  }

  const methods = {
    /**
     * @return {ol.style.Fill}
     * @protected
     */
    createStyle () {
      return new Fill({
        color: this.color
      })
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this.$parent && this.$parent.setFill(this)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.$parent && this.$parent.setFill(undefined)
    }
  }

  const watch = {
    color (value) {
      if (!this.$style) return

      this.$style.setColor(value)
      this.requestRefresh()
    }
  }

  export default {
    name: 'vl-style-fill',
    mixins: [style],
    props,
    methods,
    watch
  }
</script>
