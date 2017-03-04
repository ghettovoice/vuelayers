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
    }
  }

  const watch = {
    radius () {
      this.refresh()
    },
    snapToPixel () {
      this.refresh()
    }
  }

  export default {
    name: 'vl-style-circle',
    mixins: [ imageStyle ],
    props,
    methods,
    watch,
    provide () {
      return {
        setFill: this::setFill,
        setStroke: this::setStroke
      }
    }
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
