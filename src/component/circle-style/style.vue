<script>
  import Vue from 'vue'
  import Circle from 'ol/style/Circle'
  import imageStyle from '../../mixin/image-style'
  import withFillStrokeStyle from '../../mixin/with-fill-stroke-style'
  import { isEqual } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'

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
        this.scheduleRefresh()
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
        this.scheduleRefresh()
      }
    },
  }

  const watch = {
    radius (value) {
      if (this.$style && !isEqual(value, this.$style.getRadius())) {
        this.scheduleRefresh()
      }
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
