<script>
  import Vue from 'vue'
  import Circle from 'ol/style/circle'
  import { mixins, utils } from '../../core'

  const { imageStyle, withFillStrokeStyle } = mixins
  const { mergeDescriptors } = utils

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
        this.refresh()
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
        this.refresh()
      }
    },
  }

  const watch = {
    radius () {
      this.refresh()
    },
  }

  export default {
    name: 'vl-style-circle',
    mixins: [imageStyle, withFillStrokeStyle],
    props,
    methods,
    watch,
  }
</script>
