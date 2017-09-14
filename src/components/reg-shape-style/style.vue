<script>
  import Vue from 'vue'
  import RegularShape from 'ol/style/regularshape'
  import { mixins, utils } from '../../core'

  const { imageStyle, withFillStrokeStyle } = mixins
  const { mergeDescriptors } = utils

  const props = {
    points: {
      type: Number,
      required: true,
    },
    radius: Number,
    radius1: Number,
    radius2: Number,
    angle: {
      type: Number,
      default: 0,
    },
    rotation: {
      type: Number,
      default: 0,
    },
    rotateWithView: {
      type: Boolean,
      default: false,
    },
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

  export default {
    name: 'vl-style-reg-shape',
    mixins: [imageStyle, withFillStrokeStyle],
    props,
    methods,
  }
</script>
