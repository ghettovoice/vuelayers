<script>
  import RegularShape from 'ol/style/regularshape'
  import imageStyle from '../image'

  const props = {
    points: {
      type: Number,
      required: true
    },
    radius: Number,
    radius1: Number,
    radius2: Number,
    angle: {
      type: Number,
      default: 0
    },
    rotation: {
      type: Number,
      default: 0
    },
    rotateWithView: {
      type: Boolean,
      default: false
    }
  }

  const methods = {
    /**
     * @return {RegularShape}
     * @protected
     */
    createStyle () {
      return new RegularShape({
        points: this.points,
        radius: this.radius,
        radius1: this.radius1,
        radius2: this.radius2,
        angle: this.angle,
        rotation: this.rotation,
        rotateWithView: this.rotateWithView,
        snapToPixel: this.snapToPixel,
        fill: this.fill,
        stroke: this.stroke
      })
    }
  }

  export default {
    name: 'vl-style-reg-shape',
    mixins: [ imageStyle ],
    props,
    methods,
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
