<script>
  import Text from 'ol/style/text'
  import style from '../style'
  import withFillStroke from '../with-fill-stroke'

  const props = {
    font: {
      type: String,
      default: '10px sans-serif' // css font format https://developer.mozilla.org/en-US/docs/Web/CSS/font?v=control
    },
    offsetX: {
      type: Number,
      default: 0
    },
    offsetY: {
      type: Number,
      default: 0
    },
    rotateWithView: {
      type: Boolean,
      default: false
    },
    rotation: {
      type: Number,
      default: 0
    },
    scale: {
      type: Number,
      default: 1
    },
    text: String,
    textAlign: {
      type: String,
      default: 'start' // left, right, center, end, start
    },
    textBaseline: {
      type: String,
      default: 'alphabetic' // bottom, top, middle, alphabetic, hanging, ideographic
    }
  }

  const methods = {
    /**
     * @returns {ol.style.Text}
     * @protected
     */
    createStyle () {
      return new Text({
        font: this.font,
        offsetX: this.offsetX,
        offsetY: this.offsetY,
        rotateWithView: this.rotateWithView,
        rotation: this.rotation,
        scale: this.scale,
        text: this.text,
        textAlign: this.textAlign,
        textBaseline: this.textBaseline
      })
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this.$parent && this.$parent.setText(this)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.$parent && this.$parent.setText(undefined)
    }
  }

  const watch = {
    font (value) {
      if (!this.$style) return

      this.$style.setFont(value)
      this.requestRefresh()
    },
    offsetX (value) {
      if (!this.$style) return

      this.$style.setOffsetX(value)
      this.requestRefresh()
    },
    offsetY (value) {
      if (!this.$style) return

      this.$style.setOffsetY(value)
      this.requestRefresh()
    },
    rotation (value) {
      if (!this.$style) return

      this.$style.setRotation(value)
      this.requestRefresh()
    },
    scale (value) {
      if (!this.$style) return

      this.$style.setScale(value)
      this.requestRefresh()
    },
    text (value) {
      if (!this.$style) return

      this.$style.setText(value)
      this.requestRefresh()
    },
    textAlign (value) {
      if (!this.$style) return

      this.$style.setTextAlign(value)
      this.requestRefresh()
    },
    textBaseline (value) {
      if (!this.$style) return

      this.$style.setTextBaseline(value)
      this.requestRefresh()
    }
  }

  export default {
    name: 'vl-style-text',
    mixins: [style, withFillStroke],
    props,
    methods,
    watch,
    stubVNode: {
      empty: false,
      attrs () {
        return {
          class: this.$options.name
        }
      }
    }
  }
</script>
