<script>
  import RegularShape from 'ol/style/RegularShape'
  /**
   * @module reg-shape-style/style
   */
  import Vue from 'vue'
  import imageStyle from '../../mixin/image-style'
  import withFillStrokeStyle from '../../mixin/with-fill-stroke-style'
  import mergeDescriptors from '../../util/multi-merge-descriptors'

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
     * @return {RegularShape}
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
     * @param {Fill|Vue|undefined} fill
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
     * @param {Stroke|Vue|undefined} stroke
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
