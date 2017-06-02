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
     * @param {ol.style.Fill|Vue|undefined} fill
     * @return {void}
     */
    setFill (fill) {
      fill = fill instanceof Vue ? fill.style : fill
      this.fill = fill
      this.deferRefresh()
    },
    /**
     * @param {ol.style.Stroke|Vue|undefined} stroke
     * @return {void}
     */
    setStroke (stroke) {
      stroke = stroke instanceof Vue ? stroke.style : stroke
      this.stroke = stroke
      this.deferRefresh()
    },
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
    }
  }

  const watch = {
    radius () {
      this.deferRefresh()
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
