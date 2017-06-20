<script>
  import Vue from 'vue'
  import Circle from 'ol/style/circle'
  import imageStyle from '../image'
  import withFillStroke from '../with-fill-stroke'

  const props = {
    radius: {
      type: Number,
      default: 5
    }
  }

  const methods = {
    /**
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
     * @param {ol.style.Fill|Vue|undefined} fill
     * @return {void}
     */
    setFill (fill) {
      fill = fill instanceof Vue ? fill.style : fill
      if (fill !== this.fill) {
        this.fill = fill
        this.requestRefresh()
      }
    },
    /**
     * @param {ol.style.Stroke|Vue|undefined} stroke
     * @return {void}
     */
    setStroke (stroke) {
      stroke = stroke instanceof Vue ? stroke.style : stroke
      if (stroke !== this.stroke) {
        this.stroke = stroke
        this.requestRefresh()
      }
    }
  }

  const watch = {
    radius () {
      this.requestRefresh()
    }
  }

  export default {
    name: 'vl-style-circle',
    mixins: [imageStyle, withFillStroke],
    props,
    methods,
    watch
  }
</script>
