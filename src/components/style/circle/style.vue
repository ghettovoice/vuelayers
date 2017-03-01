<script>
  import ol from 'openlayers'
  import imageStyle from 'vuelayers/src/mixins/style/image'

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
     * @return {{setFill: methods.reCreate, setStroke: methods.reCreate}}
     * @protected
     */
    getStyleTarget () {
      return {
        setFill: this::setFill,
        setStroke: this::setStroke
      }
    }
  }

  export default {
    name: 'vl-style-circle',
    mixins: [ imageStyle ],
    props,
    methods
  }

  function setFill (fill) {
    /**
     * @type {ol.style.Fill}
     * @private
     */
    this.fill = fill
  }

  function setStroke (stroke) {
    /**
     * @type {ol.style.Stroke}
     * @private
     */
    this.stroke = stroke
  }
</script>

<style>/* stub styles */</style>
