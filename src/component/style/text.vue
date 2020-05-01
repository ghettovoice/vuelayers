<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <slot>
      <FillStyle color="#222" />
      <StrokeStyle color="#eee" />
    </slot>
    <BackgroundStyle>
      <slot name="background" />
    </BackgroundStyle>
  </i>
</template>

<script>
  import { Text as TextStyle } from 'ol/style'
  import { fillStyleContainer, strokeStyleContainer, style } from '../../mixin'
  import { isEqual, isFunction } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'
  import BackgroundStyle from './background.vue'
  import FillStyle from './fill'
  import StrokeStyle from './stroke'

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
        await this.rotateWithView(value)
      },
      async scale (value) {
        await this.setScale(value)
      },
      async text (value) {
        await this.setText(value)
      },
      async textAlign (value) {
        await this.textAlign(value)
      },
      async textBaseline (value) {
        await this.setTextBaseline(value)
      },
      async padding (value) {
        await this.setPadding(value)
      },
    },
    created () {
      this._bgFill = undefined
      this._bgFillVm = undefined
      this._bgStroke = undefined
      this._bgStrokeVm = undefined

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
      async getFont () {
        return (await this.resolveStyle()).getFont()
      },
      async setFont (font) {
        const style = await this.resolveStyle()

        if (font === style.getFont()) return

        style.setFont(font)

        await this.scheduleRemount()
      },
      async getMaxAngle () {
        return (await this.resolveStyle()).getMaxAngle()
      },
      async setMaxAngle (maxAngle) {
        const style = await this.resolveStyle()

        if (maxAngle === style.getMaxAngle()) return

        style.setMaxAngle(maxAngle)

        await this.scheduleRemount()
      },
      async getOffsetX () {
        return (await this.resolveStyle()).getOffsetX()
      },
      async setOffsetX (offsetX) {
        const style = await this.resolveStyle()

        if (offsetX === style.getOffsetX()) return

        style.setOffsetX(offsetX)

        await this.scheduleRemount()
      },
      async getOffsetY () {
        return (await this.resolveStyle()).getOffsetY()
      },
      async setOffsetY (offsetY) {
        const style = await this.resolveStyle()

        if (offsetY === style.getOffsetY()) return

        style.setOffsetY(offsetY)

        await this.scheduleRemount()
      },
      async getOverflow () {
        return (await this.resolveStyle()).getOverflow()
      },
      async setOverflow (overflow) {
        const style = await this.resolveStyle()

        if (overflow === style.getOverflow()) return

        style.setOverflow(overflow)

        await this.scheduleRemount()
      },
      async getPadding () {
        return (await this.resolveStyle()).getPadding()
      },
      async setPadding (padding) {
        const style = await this.resolveStyle()

        if (isEqual(padding, style.getPadding())) return

        style.setPadding(padding)

        await this.scheduleRemount()
      },
      async getPlacement () {
        return (await this.resolveStyle()).getPlacement()
      },
      async setPlacement (placement) {
        const style = await this.resolveStyle()

        if (placement === style.getPlacement()) return

        style.setPlacement(placement)

        await this.scheduleRemount()
      },
      async getRotateWithView () {
        return (await this.resolveStyle()).getRotateWithView()
      },
      async setRotateWithView (rotateWithView) {
        const style = await this.resolveStyle()

        if (rotateWithView === style.getRotateWithView()) return

        style.setRotateWithView(rotateWithView)

        await this.scheduleRemount()
      },
      async getRotation () {
        return (await this.resolveStyle()).getRotation()
      },
      async setRotation (rotation) {
        const style = await this.resolveStyle()

        if (rotation === style.getRotation()) return

        style.setRotation(rotation)

        await this.scheduleRemount()
      },
      async getScale () {
        return (await this.resolveStyle()).getScale()
      },
      async setScale (scale) {
        const style = await this.resolveStyle()

        if (scale === style.getScale()) return

        style.setScale(scale)

        await this.scheduleRemount()
      },
      async getText () {
        return (await this.resolveStyle()).getText()
      },
      async setText (text) {
        const style = await this.resolveStyle()

        if (text === style.getText()) return

        style.setText(text)

        await this.scheduleRemount()
      },
      async getTextAlign () {
        return (await this.resolveStyle()).getTextAlign()
      },
      async setTextAlign (textAlign) {
        const style = await this.resolveStyle()

        if (textAlign === style.getTextAlign()) return

        style.setTextAlign(textAlign)

        await this.scheduleRemount()
      },
      async getTextBaseline () {
        return (await this.resolveStyle()).getTextBaseline()
      },
      async setTextBaseline (textBaseline) {
        const style = await this.resolveStyle()

        if (textBaseline === style.getTextBaseline()) return

        style.setTextBaseline(textBaseline)

        await this.scheduleRemount()
      },
      async getFillStyleTarget () {
        const style = await this.resolveStyle()

        return {
          getFill: ::style.getFill,
          setFill: async fill => {
            style.setFill(fill)

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
          getStroke: ::style.getStroke,
          setStroke: async stroke => {
            style.setStroke(stroke)

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
        let fillVm
        if (fill && isFunction(fill.resolveOlObject)) {
          fillVm = fill
          fill = await fill.resolveOlObject()
        }

        const style = await this.resolveStyle()
        if (fill !== style.getBackgroundFill()) {
          style.setBackgroundFill(fill)
          this._bgFill = fill
          this._bgFillVm = fillVm || (fill?.vm && fill.vm[0])

          if (process.env.VUELAYERS_DEBUG) {
            this.$logger.log('backgroundFill changed, scheduling remount...')
          }

          await this.scheduleRemount()
        }
      },
      getBackgroundStroke () {
        return this._bgStroke
      },
      async setBackgroundStroke (stroke) {
        let strokeVm
        if (stroke && isFunction(stroke.resolveOlObject)) {
          strokeVm = stroke
          stroke = await stroke.resolveOlObject()
        }

        const style = await this.resolveStyle()
        if (stroke !== style.getBackgroundStroke()) {
          style.setBackgroundStroke(stroke)
          this._bgStroke = stroke
          this._bgStrokeVm = strokeVm || (stroke?.vm && stroke.vm[0])

          if (process.env.VUELAYERS_DEBUG) {
            this.$logger.log('backgroundStroke changed, scheduling remount...')
          }

          await this.scheduleRemount()

          await this.scheduleRemount()
        }
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
