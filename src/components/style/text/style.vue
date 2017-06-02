<script>
  import Text from 'ol/style/text'
  import style from '../style'
  import withFillStroke from '../with-fill-stroke'
  import { assertHasStyle } from '../../../utils/assert'

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
      this.$parent.setText(this)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.$parent.setText(undefined)
    }
  }

  const watch = {
    font (value) {
      assertHasStyle(this)
      this.style.setFont(value)
      this.deferRefresh()
    },
    offsetX (value) {
      assertHasStyle(this)
      this.style.setOffsetX(value)
      this.deferRefresh()
    },
    offsetY (value) {
      assertHasStyle(this)
      this.style.setOffsetY(value)
      this.deferRefresh()
    },
    rotation (value) {
      assertHasStyle(this)
      this.style.setRotation(value)
      this.deferRefresh()
    },
    scale (value) {
      assertHasStyle(this)
      this.style.setScale(value)
      this.deferRefresh()
    },
    text (value) {
      assertHasStyle(this)
      this.style.setText(value)
      this.deferRefresh()
    },
    textAlign (value) {
      assertHasStyle(this)
      this.style.setTextAlign(value)
      this.deferRefresh()
    },
    textBaseline (value) {
      assertHasStyle(this)
      this.style.setTextBaseline(value)
      this.deferRefresh()
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
          id: this.$options.name
        }
      }
    }
  }
</script>
