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
