<script>
  import Text from 'ol/style/Text'
  import style from '../../mixin/style'
  import { isEqual } from '../../util/minilo'
  import withFillStrokeStyle from '../../mixin/with-fill-stroke-style'
  import mergeDescriptors from '../../util/multi-merge-descriptors'

  const props = {
    font: {
      type: String,
      default: '10px sans-serif', // css font format https://developer.mozilla.org/en-US/docs/Web/CSS/font?v=control
    },
    placement: String,
    offsetX: {
      type: Number,
      default: 0,
    },
    offsetY: {
      type: Number,
      default: 0,
    },
    rotateWithView: {
      type: Boolean,
      default: false,
    },
    rotation: {
      type: Number,
      default: 0,
    },
    scale: {
      type: Number,
      default: 1,
    },
    text: String,
    textAlign: String, // left, right, center, end, start
    textBaseline: String, // bottom, top, middle, alphabetic, hanging, ideographic
  }

  const methods = {
    /**
     * @returns {Text}
     * @protected
     */
    createStyle () {
      return new Text({
        font: this.font,
        placement: this.placement,
        offsetX: this.offsetX,
        offsetY: this.offsetY,
        rotateWithView: this.rotateWithView,
        rotation: this.rotation,
        scale: this.scale,
        text: this.text,
        textAlign: this.textAlign,
        textBaseline: this.textBaseline,
        fill: this._fill,
        stroke: this._stroke,
      })
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this.$stylesContainer && this.$stylesContainer.setText(this)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.$stylesContainer && this.$stylesContainer.setText(undefined)
    },
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(this::style.methods.getServices(), {
        get stylesContainer () { return vm },
      })
    },
  }

  const watch = {
    font (value) {
      if (this.$style && !isEqual(value, this.$style.getFont())) {
        this.$style.setFont(value)
        this.scheduleRefresh()
      }
    },
    offsetX (value) {
      if (this.$style && !isEqual(value, this.$style.getOffsetX())) {
        this.$style.setOffsetX(value)
        this.scheduleRefresh()
      }
    },
    offsetY (value) {
      if (this.$style && !isEqual(value, this.$style.getOffsetY())) {
        this.$style.setOffsetY(value)
        this.scheduleRefresh()
      }
    },
    rotation (value) {
      if (this.$style && !isEqual(value, this.$style.getRotation())) {
        this.$style.setRotation(value)
        this.scheduleRefresh()
      }
    },
    scale (value) {
      if (this.$style && !isEqual(value, this.$style.getScale())) {
        this.$style.setScale(value)
        this.scheduleRefresh()
      }
    },
    text (value) {
      if (this.$style && !isEqual(value, this.$style.getText())) {
        this.$style.setText(value)
        this.scheduleRefresh()
      }
    },
    textAlign (value) {
      if (this.$style && !isEqual(value, this.$style.getTextAlign())) {
        this.$style.setTextAlign(value)
        this.scheduleRefresh()
      }
    },
    textBaseline (value) {
      if (this.$style && !isEqual(value, this.$style.getTextBaseline())) {
        this.$style.setTextBaseline(value)
        this.scheduleRefresh()
      }
    },
  }

  export default {
    name: 'vl-style-text',
    mixins: [style, withFillStrokeStyle],
    props,
    methods,
    watch,
    stubVNode: {
      empty: false,
      attrs () {
        return {
          class: this.$options.name,
        }
      },
    },
  }
</script>
