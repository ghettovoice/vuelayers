<script>
  /**
   * Style wrapper.
   * Acts as an style container that will be injected into "style" slot inside layer or feature components.
   */
  import Style from 'ol/style/style'
  import { warn } from 'vl-utils/debug'
  import { isFunction, isArray } from 'vl-utils/func'
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
     * @return {Style}
     * @protected
     */
    createStyle () {
      return new Style({
        zIndex: this.zIndex,
        fill: this.fill,
        stroke: this.stroke,
        image: this.image
      })
    },
    mountStyle () {
      let currentStyle = this.getStyle() || []
      if (currentStyle && !isArray(currentStyle)) {
        if (isFunction(currentStyle) && process.env.NODE_ENV !== 'production') {
          warn('Avoid combining vl-style-func and vl-style-container components on the same level ' +
               'because it can lead to the wrong result')
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
      if (currentStyle && !isArray(currentStyle)) {
        if (isFunction(currentStyle) && process.env.NODE_ENV !== 'production') {
          warn('Style target already has defined style that is not an array. ' +
               'Avoid combining vl-style-func and vl-style-container components on the same level ' +
               'because it can lead to the wrong result')
        }
        currentStyle = []
      }

      currentStyle = currentStyle.filter(x => x.style !== this.style)
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
    inject: style.inject.concat([ 'setStyle', 'getStyle' ]),
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
     * @type {Fill}
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
     * @type {Stroke}
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
     * @type {Image}
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
