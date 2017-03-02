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
    zIndex: Number
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
    append () {
      if (!this.styleTarget) return

      let currentStyle = this.styleTarget.getStyle() || []
      currentStyle.push(this.style)
      this.styleTarget.setStyle(currentStyle)
    },
    remove () {
      if (!this.styleTarget) return

      let currentStyle = (this.styleTarget.getStyle() || []).filter(style => style !== this.style)
      currentStyle.length || (currentStyle = undefined)
      this.styleTarget.setStyle(currentStyle)
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
    props,
    methods,
    watch
  }

  function setFill (fill) {
    /**
     * @type {ol.style.Fill}
     * @protected
     */
    this.fill = fill

    if (this.style) {
      this.style.setFill(this.fill)
      this.append()
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
      this.append()
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
      this.append()
    }
  }
</script>

<style>/* stub styles */</style>
