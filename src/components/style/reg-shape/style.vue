<script>
  import RegularShape from 'ol/style/regularshape'
  import imageStyle from '../image'
  import { SERVICE_CONTAINER_KEY } from '../../../consts'

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
     * @return {ol.style.RegularShape}
     * @protected
     */
    createStyle () {
      return RegularShape({
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
    },
    /**
     * @param {ol.style.Fill} fill
     * @return {void}
     * @protected
     */
    setFill (fill) {
      this.fill = fill
      this.deferRefresh()
    },
    /**
     * @param {ol.style.Stroke} stroke
     * @return {void}
     * @protected
     */
    setStroke (stroke) {
      this.stroke = stroke
      this.deferRefresh()
    }
  }

  export default {
    name: 'vl-style-reg-shape',
    mixins: [imageStyle],
    props,
    methods,
    provide () {
      return {
        [SERVICE_CONTAINER_KEY]: {
          styleTarget: {
            setFill: this.setFill,
            setStroke: this.setStroke
          }
        }
      }
    }
  }
</script>
