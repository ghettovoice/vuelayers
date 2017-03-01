<script>
  import ol from 'openlayers'
  import style from 'vuelayers/src/mixins/style/style'

  const props = {
    color: {
      type: [ String, Array ],
      default: null
    }
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
    append () {
      this.styleTarget && this.styleTarget.setFill(this.style)
    },
    /**
     * @protected
     */
    remove () {
      this.styleTarget && this.styleTarget.setFill(undefined)
    }
  }

  const watch = {
    color (value) {
      this.style.setColor(value)
    }
  }

  export default {
    name: 'vl-style-fill',
    mixins: [ style ],
    props,
    methods,
    watch
  }
</script>

<style>/* stub styles */</style>
