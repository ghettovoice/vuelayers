<script>
  import Vue from 'vue'
  import Circle from 'ol/style/circle'
  import imageStyle from '../image'
  import withFillStroke from '../with-fill-stroke'
  import mergeDescriptors from '../../../utils/multi-merge-descriptors'

  const props = {
    radius: {
      type: Number,
      default: 5,
    },
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
        fill: this._fill,
        stroke: this._stroke,
      })
    },
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(this::imageStyle.methods.getServices(), {
        get stylesContainer () { return vm },
      })
    },
    /**
     * @param {ol.style.Fill|Vue|undefined} fill
     * @return {void}
     */
    setFill (fill) {
      fill = fill instanceof Vue ? fill.$style : fill

      if (fill !== this._fill) {
        this._fill = fill
        this.requestRefresh()
      }
    },
    /**
     * @param {ol.style.Stroke|Vue|undefined} stroke
     * @return {void}
     */
    setStroke (stroke) {
      stroke = stroke instanceof Vue ? stroke.$style : stroke

      if (stroke !== this._stroke) {
        this._stroke = stroke
        this.requestRefresh()
      }
    },
  }

  const watch = {
    radius () {
      this.requestRefresh()
    },
  }

  export default {
    name: 'vl-style-circle',
    mixins: [imageStyle, withFillStroke],
    props,
    methods,
    watch,
  }
</script>
