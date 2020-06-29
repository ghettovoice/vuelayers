<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <slot>
      <FillStyle
        :id="'vl-' + id + '-default-fill-style'"
        color="#222" />
      <StrokeStyle
        :id="'vl-' + id + '-default-stroke-style'"
        color="#eee" />
    </slot>
    <BackgroundStyle :id="'vl-' + id + '-background-style'">
      <slot name="background" />
    </BackgroundStyle>
  </i>
</template>

<script>
  import debounce from 'debounce-promise'
  import { Text as TextStyle } from 'ol/style'
  import { fillStyleContainer, FRAME_TIME, strokeStyleContainer, style } from '../../mixin'
  import { dumpFillStyle, dumpStrokeStyle } from '../../ol-ext'
  import { clonePlainObject, isEqual, isFunction } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'
  import BackgroundStyle from './background.vue'
  import FillStyle from './fill.vue'
  import StrokeStyle from './stroke.vue'

  export default {
    name: 'VlStyleText',
    components: {
      BackgroundStyle,
      FillStyle,
      StrokeStyle,
    },
    mixins: [
      fillStyleContainer,
      strokeStyleContainer,
      style,
    ],
    stubVNode: {
      empty: false,
      attrs () {
        return {
          id: this.vmId,
          class: this.vmClass,
        }
      },
    },
    props: {
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
    },
    computed: {
      currentBackgroundFill () {
        if (!(this.rev && this.$bgFill)) return

        return dumpFillStyle(this.$bgFill)
      },
      currentBackgroundStroke () {
        if (!(this.rev && this.$bgStroke)) return

        return dumpStrokeStyle(this.$bgStroke)
      },
    },
    watch: {
      async font (value) {
        await this.setFont(value)
      },
      async maxAngle (value) {
        await this.setMaxAngle(value)
      },
      async placement (value) {
        await this.setPlacement(value)
      },
      async offsetX (value) {
        await this.setOffsetX(value)
      },
      async offsetY (value) {
        await this.setOffsetY(value)
      },
      async overflow (value) {
        await this.setOverflow(value)
      },
      async rotation (value) {
        await this.setRotation(value)
      },
      async rotateWithView (value) {
        await this.setRotateWithView(value)
      },
      async scale (value) {
        await this.setScale(value)
      },
      async text (value) {
        await this.setText(value)
      },
      async textAlign (value) {
        await this.setTextAlign(value)
      },
      async textBaseline (value) {
        await this.setTextBaseline(value)
      },
      async padding (value) {
        await this.setPadding(value)
      },
      currentBackgroundFill: {
        deep: true,
        handler: /*#__PURE__*/debounce(function (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:backgroundFill', value && clonePlainObject(value))
        }, FRAME_TIME),
      },
      currentBackgroundStroke: {
        deep: true,
        handler: /*#__PURE__*/debounce(function (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:backgroundStroke', value && clonePlainObject(value))
        }, FRAME_TIME),
      },
    },
    created () {
      this._bgFill = null
      this._bgFillVm = null
      this._bgStroke = null
      this._bgStrokeVm = null

      this::defineServices()
    },
    methods: {
      /**
       * @returns {Text}
       * @protected
       */
      createStyle () {
        return new TextStyle({
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
          padding: this.padding,
          fill: this.$fill,
          stroke: this.$stroke,
          backgroundFill: this.$bgFill,
          backgroundStroke: this.$bgStroke,
        })
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async mount () {
        if (this.$textStyleContainer) {
          await this.$textStyleContainer.setText(this)
        }

        return this::style.methods.mount()
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async unmount () {
        if (this.$textStyleContainer) {
          await this.$textStyleContainer.setText(null)
        }

        return this::style.methods.unmount()
      },
      /**
       * @returns {Object}
       * @protected
       */
      getServices () {
        const vm = this

        return mergeDescriptors(
          this::style.methods.getServices(),
          this::fillStyleContainer.methods.getServices(),
          this::strokeStyleContainer.methods.getServices(),
          {
            get bgStyleContainer () { return vm },
          },
        )
      },
      async getFont () {
        return (await this.resolveStyle()).getFont()
      },
      async setFont (font) {
        if (font === await this.getFont()) return

        (await this.resolveStyle()).setFont(font)
        await this.scheduleRemount()
      },
      async getMaxAngle () {
        return (await this.resolveStyle()).getMaxAngle()
      },
      async setMaxAngle (maxAngle) {
        if (maxAngle === await this.getMaxAngle()) return

        (await this.resolveStyle()).setMaxAngle(maxAngle)
        await this.scheduleRemount()
      },
      async getOffsetX () {
        return (await this.resolveStyle()).getOffsetX()
      },
      async setOffsetX (offsetX) {
        if (offsetX === await this.getOffsetX()) return

        (await this.resolveStyle()).setOffsetX(offsetX)
        await this.scheduleRemount()
      },
      async getOffsetY () {
        return (await this.resolveStyle()).getOffsetY()
      },
      async setOffsetY (offsetY) {
        if (offsetY === await this.getOffsetY()) return

        (await this.resolveStyle()).setOffsetY(offsetY)
        await this.scheduleRemount()
      },
      async getOverflow () {
        return (await this.resolveStyle()).getOverflow()
      },
      async setOverflow (overflow) {
        if (overflow === await this.getOverflow()) return

        (await this.resolveStyle()).setOverflow(overflow)
        await this.scheduleRemount()
      },
      async getPadding () {
        return (await this.resolveStyle()).getPadding()
      },
      async setPadding (padding) {
        if (isEqual(padding, await this.getPadding())) return

        (await this.resolveStyle()).setPadding(padding)
        await this.scheduleRemount()
      },
      async getPlacement () {
        return (await this.resolveStyle()).getPlacement()
      },
      async setPlacement (placement) {
        if (placement === await this.getPlacement()) return

        (await this.resolveStyle()).setPlacement(placement)
        await this.scheduleRemount()
      },
      async getRotateWithView () {
        return (await this.resolveStyle()).getRotateWithView()
      },
      async setRotateWithView (rotateWithView) {
        if (rotateWithView === await this.getRotateWithView()) return

        (await this.resolveStyle()).setRotateWithView(rotateWithView)
        await this.scheduleRemount()
      },
      async getRotation () {
        return (await this.resolveStyle()).getRotation()
      },
      async setRotation (rotation) {
        if (rotation === await this.getRotation()) return

        (await this.resolveStyle()).setRotation(rotation)
        await this.scheduleRemount()
      },
      async getScale () {
        return (await this.resolveStyle()).getScale()
      },
      async setScale (scale) {
        if (scale === await this.getScale()) return

        (await this.resolveStyle()).setScale(scale)
        await this.scheduleRemount()
      },
      async getText () {
        return (await this.resolveStyle()).getText()
      },
      async setText (text) {
        if (text === await this.getText()) return

        (await this.resolveStyle()).setText(text)
        await this.scheduleRemount()
      },
      async getTextAlign () {
        return (await this.resolveStyle()).getTextAlign()
      },
      async setTextAlign (textAlign) {
        if (textAlign === await this.getTextAlign()) return

        (await this.resolveStyle()).setTextAlign(textAlign)
        await this.scheduleRemount()
      },
      async getTextBaseline () {
        return (await this.resolveStyle()).getTextBaseline()
      },
      async setTextBaseline (textBaseline) {
        if (textBaseline === await this.getTextBaseline()) return

        (await this.resolveStyle()).setTextBaseline(textBaseline)
        await this.scheduleRemount()
      },
      async getFillStyleTarget () {
        const style = await this.resolveStyle()

        return {
          setFill: async fill => {
            style.setFill(fill)
            ++this.rev

            if (process.env.VUELAYERS_DEBUG) {
              this.$logger.log('fill changed, scheduling remount...')
            }

            await this.scheduleRemount()
          },
        }
      },
      async getStrokeStyleTarget () {
        const style = await this.resolveStyle()

        return {
          setStroke: async stroke => {
            style.setStroke(stroke)
            ++this.rev

            if (process.env.VUELAYERS_DEBUG) {
              this.$logger.log('stroke changed, scheduling remount...')
            }

            await this.scheduleRemount()
          },
        }
      },
      getBackgroundFill () {
        return this._bgFill
      },
      async setBackgroundFill (fill) {
        if (fill && isFunction(fill.resolveOlObject)) {
          fill = await fill.resolveOlObject()
        }
        fill || (fill = null)

        if (fill === this._bgFill) return

        this._bgFill = fill
        this._bgFillVm = fill?.vm && fill.vm[0]
        const style = await this.resolveStyle()
        style.setBackgroundFill(fill)
        ++this.rev

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('backgroundFill changed, scheduling remount...')
        }

        await this.scheduleRemount()
      },
      getBackgroundStroke () {
        return this._bgStroke
      },
      async setBackgroundStroke (stroke) {
        if (stroke && isFunction(stroke.resolveOlObject)) {
          stroke = await stroke.resolveOlObject()
        }
        stroke || (stroke = null)

        if (stroke === this._bgStroke) return

        this._bgStroke = stroke
        this._bgStrokeVm = stroke?.vm && stroke.vm[0]
        const style = await this.resolveStyle()
        style.setBackgroundStroke(stroke)
        ++this.rev

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('backgroundStroke changed, scheduling remount...')
        }

        await this.scheduleRemount()
      },
    },
  }

  function defineServices () {
    Object.defineProperties(this, {
      $textStyleContainer: {
        enumerable: true,
        get: () => this.$services?.textStyleContainer,
      },
      $bgFill: {
        enumerable: true,
        get: this.getBackgroundFill,
      },
      $bgFillVm: {
        enumerable: true,
        get: () => this._bgFillVm,
      },
      $bgStroke: {
        enumerable: true,
        get: this.getBackgroundStroke,
      },
      $bgStrokeVm: {
        enumerable: true,
        get: () => this._bgStrokeVm,
      },
    })
  }
</script>
