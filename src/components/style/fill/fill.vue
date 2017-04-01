<script>
  import Fill from 'ol/style/fill'
  import style from 'vl-components/style/style'

  const props = {
    color: [ String, Array ]
  }

  const methods = {
    /**
     * @return {Fill}
     * @protected
     */
    createStyle () {
      return new Fill({
        color: this.color
      })
    },
    /**
     * @protected
     */
    mountStyle () {
      this.setFill(this.style)
    },
    /**
     * @protected
     */
    unmountStyle () {
      this.setFill(undefined)
    }
  }

  const watch = {
    color (value) {
      this.style.setColor(value)
      this.refresh()
    }
  }

  export default {
    name: 'vl-style-fill',
    mixins: [ style ],
    inject: [ 'setFill' ],
    props,
    methods,
    watch
  }
</script>
