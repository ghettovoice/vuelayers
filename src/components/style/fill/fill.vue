<script>
  import ol from 'vl-ol'
  import style from 'vl-components/style/style'

  const props = {
    color: [ String, Array ]
  }

  const methods = {
    /**
     * @return {ol.style.Fill}
     * @protected
     */
    createStyle () {
      return new ol.style.Fill({
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

<style>/* stub styles */</style>
