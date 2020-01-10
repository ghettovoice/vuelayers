<template>
  <i :id="vmId" :class="cmpName" style="display: none !important;">
    <slot />
    <slot name="background" />
  </i>
</template>

<script>
  import Vue from 'vue'
  import Text from 'ol/style/Text'
  import { style, withFillStrokeStyle } from '../../mixin'
  import { isEqual } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'

  const props = {
    font: {
      type: String,
      default: '10px sans-serif', // css font format https://developer.mozilla.org/en-US/docs/Web/CSS/font?v=control
    },
    maxAngle: Number,
    placement: String,
    offsetX: {
      type: Number,
      default: 0,
    },
    offsetY: {
      type: Number,
      default: 0,
    },
    overflow: Boolean,
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
    padding: {
      type: Array,
      default: () => [0, 0, 0, 0],
      validate: val => val.length && val.length === 4,
    },
  }

  const methods = {
    /**
     * @returns {Text}
     * @protected
     */
    createStyle () {
      return new Text({
        font: this.font,
        maxAngle: this.maxAngle,
        placement: this.placement,
        offsetX: this.offsetX,
        offsetY: this.offsetY,
        overflow: this.overflow,
        rotateWithView: this.rotateWithView,
        rotation: this.rotation,
        scale: this.scale,
        text: this.text,
        textAlign: this.textAlign,
        textBaseline: this.textBaseline,
        fill: this._fill,
        stroke: this._stroke,
        padding: this.padding,
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
    /**
     * @param {Fill|Vue|undefined} fill
     * @return {void}
     * @protected
     */
    setFill (fill) {
      if (!(fill instanceof Vue)) {
        this::withFillStrokeStyle.methods.setFill(fill)
      }

      const isBg = this.$slots.background.find(vnode => {
        return vnode.componentInstance && vnode.componentInstance === fill
      })

      if (!isBg) {
        this::withFillStrokeStyle.methods.setFill(fill)
      }

      fill = fill.$style

      if (this.$style && fill !== this.$style.getBackgroundFill()) {
        this.$style.setBackgroundFill(fill)
        this.scheduleRefresh()
      }
    },
    /**
     * @param {Stroke|Vue|undefined} stroke
     * @return {void}
     * @protected
     */
    setStroke (stroke) {
      if (!(stroke instanceof Vue)) {
        this::withFillStrokeStyle.methods.setStroke(stroke)
      }

      const isBg = this.$slots.background.find(vnode => {
        return vnode.componentInstance && vnode.componentInstance === stroke
      })

      if (!isBg) {
        this::withFillStrokeStyle.methods.setStroke(stroke)
      }

      stroke = stroke.$style

      if (this.$style && stroke !== this.$style.getBackgroundStroke()) {
        this.$style.setBackgroundStroke(stroke)
        this.scheduleRefresh()
      }
    },
  }

  const watch = {
    font (value) {
      if (this.$style && !isEqual(value, this.$style.getFont())) {
        this.$style.setFont(value)
        this.scheduleRefresh()
      }
    },
    maxAngle (value) {
      if (this.$style && !isEqual(value, this.$style.getMaxAngle())) {
        this.$style.setMaxAngle(value)
        this.scheduleRefresh()
      }
    },
    placement (value) {
      if (this.$style && !isEqual(value, this.$style.getPlacement())) {
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
    overflow (value) {
      if (this.$style && !isEqual(value, this.$style.getOverflow())) {
        this.$style.setOverflow(value)
        this.scheduleRefresh()
      }
    },
    rotation (value) {
      if (this.$style && !isEqual(value, this.$style.getRotation())) {
        this.$style.setRotation(value)
        this.scheduleRefresh()
      }
    },
    rotateWithView (value) {
      if (this.$style && !isEqual(value, this.$style.getRotateWithView())) {
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
    padding (value) {
      if (this.$style && !isEqual(value, this.$style.getPadding())) {
        this.$style.setPadding(value)
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
          id: this.vmId,
          class: this.cmpName,
        }
      },
    },
  }
</script>
