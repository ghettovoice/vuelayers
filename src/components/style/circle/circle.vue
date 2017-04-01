<script>
  import Circle from 'ol/style/circle'
  import imageStyle from 'vl-components/style/image'

  const props = {
    radius: {
      type: Number,
      default: 5
    }
  }

  const methods = {
    /**
     * @return {Circle}
     * @protected
     */
    createStyle () {
      return new Circle({
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
  // todo do not recreate if already create and has fill/stroke, use setters instead
  function setFill (fill) {
    /**
     * @type {Fill}
     * @private
     */
    this.fill = fill
    this.refresh()
  }

  function setStroke (stroke) {
    /**
     * @type {Stroke}
     * @private
     */
    this.stroke = stroke
    this.refresh()
  }
</script>
