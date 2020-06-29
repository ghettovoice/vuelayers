<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <slot>
      <CircleStyle :id="'vl-' + id + '-default-circle-style'" />
      <FillStyle :id="'vl-' + id + '-default-fill-style'" />
      <StrokeStyle :id="'vl-' + id + '-default-stroke-style'" />
    </slot>
  </i>
</template>

<script>
  import { Style } from 'ol/style'
  import {
    fillStyleContainer,
    geometryContainer,
    imageStyleContainer,
    strokeStyleContainer,
    style,
    textStyleContainer,
  } from '../../mixin'
  import { mergeDescriptors } from '../../util'
  import CircleStyle from './circle.vue'
  import FillStyle from './fill.vue'
  import StrokeStyle from './stroke.vue'

  /**
   * Style box component.
   * Wrapper for Style class. Can be inserted into component with setStyle/getStyle methods (vl-layer-vector, vl-feature & etc.)
   * and acts as a box for inner style components (vl-style-fill, vl-style-stroke, icon ...)
   */
  export default {
    name: 'VlStyle',
    components: {
      CircleStyle,
      FillStyle,
      StrokeStyle,
    },
    mixins: [
      fillStyleContainer,
      strokeStyleContainer,
      textStyleContainer,
      imageStyleContainer,
      geometryContainer,
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
      /**
       * @type {number}
       */
      zIndex: {
        type: Number,
        default: 0,
      },
      /**
       * @type {function}
       */
      renderer: Function,
      /**
       * @deprecated Use v-if directive.
       * @todo remove in v0.13.x
       */
      condition: [Boolean, Function],
    },
    watch: {
      async zIndex (value) {
        await this.setZIndex(value)
      },
      async renderer (value) {
        await this.setRenderer(value)
      },
    },
    created () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.condition) {
          this.$logger.warn("'condition' is deprecated. Use v-if directive instead.")
        }
      }
    },
    updated () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.condition) {
          this.$logger.warn("'condition' is deprecated. Use v-if directive instead.")
        }
      }
    },
    methods: {
      /**
       * @return {module:ol/style/Style~Style}
       * @protected
       */
      createStyle () {
        return new Style({
          zIndex: this.zIndex,
          renderer: this.renderer,
          fill: this.$fill,
          stroke: this.$stroke,
          image: this.$image,
          text: this.$text,
          geometry: this.$geometry,
        })
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async mount () {
        if (this.$styleContainer) {
          await this.$styleContainer.addStyle(this)
        }

        return this::style.methods.mount()
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async unmount () {
        if (this.$styleContainer) {
          await this.$styleContainer.removeStyle(this)
        }

        return this::style.methods.unmount()
      },
      /**
       * @returns {Object}
       * @protected
       */
      getServices () {
        return mergeDescriptors(
          this::style.methods.getServices(),
          this::fillStyleContainer.methods.getServices(),
          this::strokeStyleContainer.methods.getServices(),
          this::textStyleContainer.methods.getServices(),
          this::imageStyleContainer.methods.getServices(),
          this::geometryContainer.methods.getServices(),
        )
      },
      async getZIndex () {
        return (await this.resolveStyle()).getZIndex()
      },
      async setZIndex (zIndex) {
        if (zIndex === await this.getZIndex()) return

        (await this.resolveStyle()).setZIndex(zIndex)
        await this.scheduleRemount()
      },
      async getRenderer () {
        return (await this.resolveStyle()).getRenderer()
      },
      async setRenderer (renderer) {
        if (renderer === await this.getRenderer()) return

        (await this.resolveStyle()).setRenderer(renderer)
        await this.scheduleRemount()
      },
      async getGeometryFunction () {
        return (await this.resolveStyle()).getGeometryFunction()
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
      async getTextStyleTarget () {
        const style = await this.resolveStyle()

        return {
          setText: async text => {
            style.setText(text)
            ++this.rev

            if (process.env.VUELAYERS_DEBUG) {
              this.$logger.log('text changed, scheduling remount...')
            }

            await this.scheduleRemount()
          },
        }
      },
      async getImageStyleTarget () {
        const style = await this.resolveStyle()

        return {
          setImage: async image => {
            style.setImage(image)
            ++this.rev

            if (process.env.VUELAYERS_DEBUG) {
              this.$logger.log('image changed, scheduling remount...')
            }

            await this.scheduleRemount()
          },
        }
      },
      async geometryContainer () {
        const style = await this.resolveStyle()

        return {
          setGeometry: async geometry => {
            style.setGeometry(geometry)
            ++this.rev

            if (process.env.VUELAYERS_DEBUG) {
              this.$logger.log('geometry changed, scheduling remount...')
            }

            await this.scheduleRemount()
          },
        }
      },
    },
  }
</script>
