<script>
  import Vue from 'vue'
  import RegularShape from 'ol/style/regularshape'
  import imageStyle from '../image'
  import withFillStroke from '../with-fill-stroke'

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
        fill: this._fill,
        stroke: this._stroke
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
    }
  }

  export default {
    name: 'vl-style-reg-shape',
    mixins: [imageStyle, withFillStroke],
    props,
    methods
  }
</script>
