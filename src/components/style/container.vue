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
  import { isFunction } from 'lodash/fp'
  import { warn } from 'vuelayers/src/utils/debug'
  import style from 'vuelayers/src/mixins/style/style'

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
      if (isFunction(currentStyle)) {
        if (process.env.NODE_ENV !== 'production') {
          warn('Target has style as ol.StyleFunction, current style will be override by component. ' +
               'To append style container you should define style as Array or ' +
               'ol.style.Style instance on the target')
        }
        currentStyle = this.style
      }

      if (currentStyle instanceof ol.style.Style) {
        currentStyle = [ currentStyle ]
      }

      currentStyle.push(this.style)
      this.styleTarget.setStyle(currentStyle)
    },
    remove () {
      if (!this.styleTarget) return

      let currentStyle = this.styleTarget.getStyle() || []
      if (isFunction(currentStyle)) {
        if (process.env.NODE_ENV !== 'production') {
          warn('Target has style as ol.StyleFunction. ' +
               'To remove style container you should define style as Array or ' +
               'ol.style.Style instance on the target')
        }
        return
      }

      if (currentStyle instanceof ol.style.Style && currentStyle === this.style) {
        this.styleTarget.setStyle(undefined)
        return
      }

      currentStyle = currentStyle.filter(style => style !== this.style)
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
  }

  function setStroke (stroke) {
    /**
     * @type {ol.style.Stroke}
     * @protected
     */
    this.stroke = stroke
  }

  function setImage (image) {
    /**
     * @type {ol.style.Image}
     * @protected
     */
    this.image = image
  }
</script>

<style>/* stub styles */</style>
