<script>
  /**
   * ol.style.Style wrapper.
   * Acts as an style container that will be injected into "style" slot inside layer or feature components.
   */
  import ol from 'vl-ol'
  import { warn } from 'vl-utils/debug'
  import style from 'vl-components/style/style'

  const props = {
    zIndex: Number,
    condition: {
      type: [ Function, Boolean ],
      default: true
    }
  }

  const methods = {
    /**
     * @return {ol.style.Style}
     * @protected
     */
    createStyle () {
      return new ol.style.Style({
        zIndex: this.zIndex,
        fill: this.fill,
        stroke: this.stroke,
        image: this.image
      })
    },
    mountStyle () {
      let currentStyle = this.getStyle() || []
      if (!Array.isArray(currentStyle)) {
        if (process.env.NODE_ENV !== 'production') {
          warn('Current style is not an array, will be replaced with new style array')
        }
        currentStyle = []
      }

      currentStyle.push({
        style: this.style,
        condition: this.condition
      })
      this.setStyle(currentStyle)
    },
    unmountStyle () {
      let currentStyle = this.getStyle() || []
      if (!Array.isArray(currentStyle)) {
        if (process.env.NODE_ENV !== 'production') {
          warn('Current style is not an array, will be replaced with new style array')
        }
        currentStyle = []
      }

      currentStyle = currentStyle.filter(s => s.style !== this.style)
      currentStyle.length || (currentStyle = undefined)
      this.setStyle(currentStyle)
    }
  }

  const watch = {
    zIndex (value) {
      this.style.setZIndex(value)
    },
    geomType () {
      this.refresh()
    }
  }

  export default {
    name: 'vl-style-container',
    mixins: [ style ],
    inject: [ 'setStyle', 'getStyle' ],
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
    },
    provide () {
      return {
        setFill: this::setFill,
        setStroke: this::setStroke,
        setImage: this::setImage
      }
    }
  }

  function setFill (fill) {
    /**
     * @type {ol.style.Fill}
     * @protected
     */
    this.fill = fill

    if (this.style) {
      this.style.setFill(this.fill)
      this.refresh()
    }
  }

  function setStroke (stroke) {
    /**
     * @type {ol.style.Stroke}
     * @protected
     */
    this.stroke = stroke

    if (this.style) {
      this.style.setStroke(this.stroke)
      this.refresh()
    }
  }

  function setImage (image) {
    /**
     * @type {ol.style.Image}
     * @protected
     */
    this.image = image

    if (this.style) {
      this.style.setImage(this.image)
      this.refresh()
    }
  }
</script>

<style>/* stub styles */</style>
