<script>
  import Vue from 'vue'
  import RegularShape from 'ol/style/RegularShape'
  import imageStyle from '../../mixin/image-style'
  import withFillStrokeStyle from '../../mixin/with-fill-stroke-style'
  import { isEqual } from '../../util/minilo'
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
        this.scheduleRefresh()
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
        this.scheduleRefresh()
      }
    },
  }

  const watch = {
    points (value) {
      if (this.$style && !isEqual(value, this.$style.getPoints())) {
        this.scheduleRefresh()
      }
    },
    radius (value) {
      if (this.$style && !isEqual(value, this.$style.getRadius())) {
        this.scheduleRefresh()
      }
    },
    radius1 (value) {
      if (this.$style && !isEqual(value, this.$style.getRadius())) {
        this.scheduleRefresh()
      }
    },
    radius2 (value) {
      if (this.$style && !isEqual(value, this.$style.getRadius2())) {
        this.scheduleRefresh()
      }
    },
    angle (value) {
      if (this.$style && !isEqual(value, this.$style.getAngle())) {
        this.scheduleRefresh()
      }
    },
    rotation (value) {
      if (this.$style && !isEqual(value, this.$style.getRotation())) {
        this.scheduleRefresh()
      }
    },
    rotateWithView (value) {
      if (this.$style && !isEqual(value, this.$style.getRotateWithView())) {
        this.scheduleRefresh()
      }
    },
  }

  export default {
    name: 'vl-style-reg-shape',
    mixins: [imageStyle, withFillStrokeStyle],
    props,
    methods,
    watch,
  }
</script>
