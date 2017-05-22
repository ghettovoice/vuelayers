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
    }
  }

  export default {
    name: 'vl-style-reg-shape',
    mixins: [imageStyle],
    props,
    methods,
    provide () {
      const vm = this

      return {
        [SERVICE_CONTAINER_KEY]: {
          get styleTarget () {
            return {
              setFill (fill) {
                vm.fill = fill
                vm.deferRefresh()
              },
              setStroke (stroke) {
                vm.stroke = stroke
                vm.deferRefresh()
              }
            }
          }
        }
      }
    }
  }
</script>
