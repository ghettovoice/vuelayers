<script>
  import Circle from 'ol/style/circle'
  import imageStyle from '../image'
  import { SERVICE_CONTAINER_KEY } from '../../../consts'

  const props = {
    radius: {
      type: Number,
      default: 5
    }
  }

  const methods = {
    /**
     * Partially initialize builder with currently available values.
     * @return {ol.style.Circle}
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
      this.deferRefresh()
    }
  }

  export default {
    name: 'vl-style-circle',
    mixins: [imageStyle],
    props,
    methods,
    watch,
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
