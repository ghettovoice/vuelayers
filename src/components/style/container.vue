<template>
  <i style="display: none !important">
    <slot></slot>
  </i>
</template>

<script>
  /**
   * ol.style.Style wrapper.
   * Acts as an style container that will be injected into "style" slot inside layer or feature components.
   */
  import ol from 'openlayers'
  import style from 'vl-components/style/style'

  const props = {
    zIndex: Number,
    // todo продумать до конца. condition будет проверяться в styleFunction, если функция - то будет вызвана в контексте { feature, resolution }
    condition: {
      type: [ Function, Boolean, String ],
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
      currentStyle.push([ this.style, this.condition ])
      this.setStyle(currentStyle)
    },
    unmountStyle () {
      let currentStyle = (this.getStyle() || []).filter(style => style[ 0 ] !== this.style)
      currentStyle.length || (currentStyle = undefined)
      this.setStyle(currentStyle)
    },
    getStyleTarget () {
      return {
        setFill: this::setFill,
        setStroke: this::setStroke,
        setImage: this::setImage
      }
    }
  }

  const watch = {
    zIndex (value) {
      this.style.setZIndex(value)
    }
  }

  export default {
    name: 'vl-style-container',
    mixins: [ style ],
    inject: [ 'setStyle', 'getStyle' ],
    props,
    methods,
    watch,
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
      this.mountStyle()
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
      this.mountStyle()
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
      this.mountStyle()
    }
  }
</script>

<style>/* stub styles */</style>
