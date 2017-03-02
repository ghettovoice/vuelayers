<script>
  import ol from 'openlayers'
  import imageStyle from 'vl-components/style/image'

  const props = {
    radius: {
      type: Number,
      default: 5
    },
    snapToPixel: {
      type: Boolean,
      default: true
    }
  }

  const methods = {
    /**
     * @return {ol.style.Circle}
     * @protected
     */
    createStyle () {
      return new ol.style.Circle({
        radius: this.radius,
        snapToPixel: this.snapToPixel,
        fill: this.fill,
        stroke: this.stroke
      })
    },
    /**
     * @return {{setFill: function, setStroke: function}}
     * @protected
     */
    getStyleTarget () {
      return {
        setFill: this::setFill,
        setStroke: this::setStroke
      }
    }
  }

  const watch = {
    radius () {
      this.refresh()
    }
  }

  export default {
    name: 'vl-style-circle',
    mixins: [ imageStyle ],
    props,
    methods,
    watch
  }

  function setFill (fill) {
    /**
     * @type {ol.style.Fill}
     * @private
     */
    this.fill = fill
    this.refresh()
  }

  function setStroke (stroke) {
    /**
     * @type {ol.style.Stroke}
     * @private
     */
    this.stroke = stroke
    this.refresh()
  }
</script>

<style>/* stub styles */</style>
