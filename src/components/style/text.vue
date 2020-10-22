<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <slot>
      <FillStyle
        :id="'vl-' + currentId + '-default-fill-style'"
        color="#333" />
      <StrokeStyle
        :id="'vl-' + currentId + '-default-stroke-style'"
        color="#eee" />
    </slot>
    <BackgroundStyle :id="'vl-' + currentId + '-background-style'">
      <slot name="background" />
    </BackgroundStyle>
  </i>
</template>

<script>
  import { Text as TextStyle } from 'ol/style'
  import { fillStyleContainer, strokeStyleContainer, style } from '../../mixins'
  import { dumpFillStyle, dumpStrokeStyle } from '../../ol-ext'
  import {
    clonePlainObject,
    coalesce,
    isEqual,
    isObjectLike,
    lowerFirst,
    makeWatchers,
    mergeDescriptors,
    upperFirst,
  } from '../../utils'
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
    data () {
      return {
        currentFont: this.font,
        currentMaxAngle: this.maxAngle,
        currentPlacement: this.placement,
        currentOffsetX: this.offsetX,
        currentOffsetY: this.offsetY,
        currentOverflow: this.overflow,
        currentRotateWithView: this.rotateWithView,
        currentRotation: this.rotation,
        currentScale: this.scale,
        currentText: this.text,
        currentTextAlign: this.textAlign,
        currentTextBaseline: this.textBaseline,
        currentPadding: this.padding?.slice(),
      }
    },
    computed: {
      inputPadding () {
        return this.padding?.slice()
      },
      stroke () {
        if (!(this.rev && this.$stroke)) return

        return dumpStrokeStyle(this.$stroke)
      },
      fill () {
        if (!(this.rev && this.$fill)) return

        return dumpFillStyle(this.$fill)
      },
      backgroundFill () {
        if (!(this.rev && this.$bgFill)) return

        return dumpFillStyle(this.$bgFill)
      },
      backgroundStroke () {
        if (!(this.rev && this.$bgStroke)) return

        return dumpStrokeStyle(this.$bgStroke)
      },
    },
    watch: {
      rev () {
        if (!this.$style) return

        this.setFont(this.getFont())
        this.setMaxAngle(this.getMaxAngle())
        this.setPlacement(this.getPlacement())
        this.setOffsetX(this.getOffsetX())
        this.setOffsetY(this.getOffsetY())
        this.setOverflow(this.getOverflow())
        this.setRotateWithView(this.getRotateWithView())
        this.setRotation(this.getRotation())
        this.setScale(this.getScale())
        this.setText(this.getText())
        this.setTextAlign(this.getTextAlign())
        this.setTextBaseline(this.getTextBaseline())
        this.setPadding(this.getPadding())
      },
      .../*#__PURE__*/makeWatchers([
        'font',
        'maxAngle',
        'placement',
        'offsetX',
        'offsetY',
        'overflow',
        'rotateWithView',
        'rotation',
        'scale',
        'text',
        'textAlign',
        'textBaseline',
        'inputPadding',
      ], inProp => {
        const prop = inProp.slice(0, 5) === 'input' ? lowerFirst(inProp.slice(5)) : inProp
        const setter = 'set' + upperFirst(prop)

        return {
          deep: [
            'inputPadding',
          ].includes(inProp),
          handler (value) {
            this[setter](value)
          },
        }
      }),
      .../*#__PURE__*/makeWatchers([
        'currentFont',
        'currentMaxAngle',
        'currentPlacement',
        'currentOffsetX',
        'currentOffsetY',
        'currentOverflow',
        'currentRotateWithView',
        'currentRotation',
        'currentScale',
        'currentText',
        'currentTextAlign',
        'currentTextBaseline',
        'currentPadding',
      ], curProp => {
        const prop = curProp.slice(0, 7) === 'current' ? lowerFirst(curProp.slice(7)) : curProp
        const inProp = 'input' + upperFirst(prop)

        return {
          deep: [
            'currentPadding',
          ].includes(curProp),
          handler (value) {
            if (isEqual(value, coalesce(this[inProp], this[prop]))) return

            this.$emit(`update:${prop}`, isObjectLike(value) ? clonePlainObject(value) : value)
          },
        }
      }),
      .../*#__PURE__*/makeWatchers([
        'fill',
        'stroke',
        'backgroundFill',
        'backgroundStroke',
      ], prop => ({
        deep: true,
        handler (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit(`update:${prop}`, isObjectLike(value) ? clonePlainObject(value) : value)
        },
      })),
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
          font: this.currentFont,
          maxAngle: this.currentMaxAngle,
          placement: this.currentPlacement,
          offsetX: this.currentOffsetX,
          offsetY: this.currentOffsetY,
          overflow: this.currentOverflow,
          rotateWithView: this.currentRotateWithView,
          rotation: this.currentRotation,
          scale: this.currentScale,
          text: this.currentText,
          textAlign: this.currentTextAlign,
          textBaseline: this.currentTextBaseline,
          padding: this.currentPadding,
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
        this.$textStyleContainer?.setText(this)

        return this::style.methods.mount()
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async unmount () {
        if (this.$textStyleContainer?.getTextVm() === this) {
          await this.$textStyleContainer.setText(null)
        }

        return this::style.methods.unmount()
      },
      /**
       * @return {Promise<void>}
       */
      async refresh () {
        await Promise.all([
          this::style.methods.refresh(),
          this.$textStyleContainer?.refresh(),
        ])
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
      /**
       * @protected
       */
      syncNonObservable () {
        this::style.methods.syncNonObservable()

        this.setFont(this.getFont())
        this.setMaxAngle(this.getMaxAngle())
        this.setPlacement(this.getPlacement())
        this.setOffsetX(this.getOffsetX())
        this.setOffsetY(this.getOffsetY())
        this.setOverflow(this.getOverflow())
        this.setRotateWithView(this.getRotateWithView())
        this.setRotation(this.getRotation())
        this.setScale(this.getScale())
        this.setText(this.getText())
        this.setTextAlign(this.getTextAlign())
        this.setTextBaseline(this.getTextBaseline())
        this.setPadding(this.getPadding())
      },
      getFont () {
        return coalesce(this.$style?.getFont(), this.currentFont)
      },
      setFont (font) {
        if (font !== this.currentFont) {
          this.currentFont = font
          this.scheduleRefresh()
        }
        if (this.$style && font !== this.$style.getFont()) {
          this.$style.setFont(font)
          this.scheduleRefresh()
        }
      },
      getMaxAngle () {
        return coalesce(this.$style?.getMaxAngle(), this.currentMaxAngle)
      },
      setMaxAngle (maxAngle) {
        if (maxAngle !== this.currentMaxAngle) {
          this.currentMaxAngle = maxAngle
          this.scheduleRefresh()
        }
        if (this.$style && maxAngle !== this.$style.getMaxAngle()) {
          this.$style.setMaxAngle(maxAngle)
          this.scheduleRefresh()
        }
      },
      getOffsetX () {
        return coalesce(this.$style?.getOffsetX(), this.currentOffsetX)
      },
      setOffsetX (offsetX) {
        if (offsetX !== this.currentOffsetX) {
          this.currentOffsetX = offsetX
          this.scheduleRefresh()
        }
        if (this.$style && offsetX !== this.$style.getOffsetX()) {
          this.$style.setOffsetX(offsetX)
          this.scheduleRefresh()
        }
      },
      getOffsetY () {
        return coalesce(this.$style?.getOffsetY(), this.currentOffsetY)
      },
      setOffsetY (offsetY) {
        if (offsetY !== this.currentOffsetY) {
          this.currentOffsetY = offsetY
          this.scheduleRefresh()
        }
        if (this.$style && offsetY !== this.$style.getOffsetY()) {
          this.$style.setOffsetY(offsetY)
          this.scheduleRefresh()
        }
      },
      getOverflow () {
        return coalesce(this.$style?.getOverflow(), this.currentOverflow)
      },
      setOverflow (overflow) {
        if (overflow !== this.currentOverflow) {
          this.currentOverflow = overflow
          this.scheduleRefresh()
        }
        if (this.$style && overflow !== this.$style.getOverflow()) {
          this.$style.setOverflow(overflow)
          this.scheduleRefresh()
        }
      },
      getPadding () {
        return coalesce(this.$style?.getPadding(), this.currentPadding)
      },
      setPadding (padding) {
        padding = padding?.slice()

        if (!isEqual(padding, this.currentPadding)) {
          this.currentPadding = padding
          this.scheduleRefresh()
        }
        if (this.$style && !isEqual(padding, this.$style.getPadding())) {
          this.$style.setPadding(padding)
          this.scheduleRefresh()
        }
      },
      getPlacement () {
        return coalesce(this.$source?.getPlacement(), this.currentPlacement)
      },
      setPlacement (placement) {
        if (placement !== this.currentPlacement) {
          this.currentPlacement = placement
          this.scheduleRefresh()
        }
        if (this.$style && placement !== this.$style.getPlacement()) {
          this.$style.setPlacement(placement)
          this.scheduleRefresh()
        }
      },
      getRotateWithView () {
        return coalesce(this.$style?.getRotateWithView(), this.currentRotateWithView)
      },
      setRotateWithView (rotateWithView) {
        if (rotateWithView !== this.currentRotateWithView) {
          this.currentRotateWithView = rotateWithView
          this.scheduleRefresh()
        }
        if (this.$style && rotateWithView !== this.$style.getRotateWithView()) {
          this.$style.setRotateWithView(rotateWithView)
          this.scheduleRefresh()
        }
      },
      getRotation () {
        return coalesce(this.$style?.getRotation(), this.currentRotation)
      },
      setRotation (rotation) {
        if (rotation !== this.currentRotation) {
          this.currentRotation = rotation
          this.scheduleRefresh()
        }
        if (this.$style && rotation !== this.$style.getRotation()) {
          this.$style.setRotation(rotation)
          this.scheduleRefresh()
        }
      },
      getScale () {
        return coalesce(this.$style?.getScale(), this.currentScale)
      },
      setScale (scale) {
        if (scale !== this.currentScale) {
          this.currentScale = scale
          this.scheduleRefresh()
        }
        if (this.$style && scale !== this.$style.getScale()) {
          this.$style.setScale(scale)
          this.scheduleRefresh()
        }
      },
      getText () {
        return coalesce(this.$style?.getText(), this.currentText)
      },
      setText (text) {
        if (text !== this.currentText) {
          this.currentText = text
          this.scheduleRefresh()
        }
        if (this.$style && text !== this.$style.getText()) {
          this.$style.setText(text)
          this.scheduleRefresh()
        }
      },
      getTextAlign () {
        return coalesce(this.$style?.getTextAlign(), this.currentTextAlign)
      },
      setTextAlign (textAlign) {
        if (textAlign !== this.currentTextAlign) {
          this.currentTextAlign = textAlign
          this.scheduleRefresh()
        }
        if (this.$style && textAlign !== this.$style.getTextAlign()) {
          this.$style.setTextAlign(textAlign)
          this.scheduleRefresh()
        }
      },
      getTextBaseline () {
        return coalesce(this.$style?.getTextBaseline(), this.currentTextBaseline)
      },
      setTextBaseline (textBaseline) {
        if (textBaseline !== this.currentTextBaseline) {
          this.currentTextBaseline = textBaseline
          this.scheduleRefresh()
        }
        if (this.$style && textBaseline !== this.$style.getTextBaseline()) {
          this.$style.setTextBaseline(textBaseline)
          this.scheduleRefresh()
        }
      },
      getFillStyleTarget () {
        return this.$style
      },
      getStrokeStyleTarget () {
        return this.$style
      },
      getBackgroundFill () {
        return this._bgFill
      },
      setBackgroundFill (fill) {
        fill = fill?.$fill || fill
        fill || (fill = undefined)

        if (fill !== this._bgFill) {
          this._bgFill = fill
          this._bgFillVm = fill?.vm && fill.vm[0]
          this.scheduleRefresh()
        }
        if (this.$style && fill !== this.$style.getBackgroundFill()) {
          this.$style.setBackgroundFill(fill)
          this.scheduleRefresh()
        }
      },
      getBackgroundStroke () {
        return this._bgStroke
      },
      setBackgroundStroke (stroke) {
        stroke = stroke?.$stroke || stroke
        stroke || (stroke = undefined)

        if (stroke !== this._bgStroke) {
          this._bgStroke = stroke
          this._bgStrokeVm = stroke?.vm && stroke.vm[0]
          this.scheduleRefresh()
        }
        if (this.$style && stroke !== this.$style.getBackgroundStroke()) {
          this.$style.setBackgroundStroke(stroke)
          this.scheduleRefresh()
        }
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
