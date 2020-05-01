<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none">
    <slot>
      <CircleStyle />
      <FillStyle />
      <StrokeStyle />
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
  import { constant, isFunction } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'
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
       * This condition will be resolved at the style compile time.
       * @type {function|boolean}
       */
      condition: {
        type: [Function, Boolean],
        default: true,
      },
    },
    computed: {
      /**
       * @type {function}
       */
      conditionFunc () {
        return isFunction(this.condition) ? this.condition : constant(this.condition)
      },
    },
    watch: {
      async zIndex (value) {
        await this.setZIndex(value)
      },
      async renderer (value) {
        await this.setRenderer(value)
      },
      async conditionFunc (value) {
        await this.scheduleRemount()
      },
    },
    created () {
      this::defineServices()
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
      async getZIndex () {
        return (await this.resolveStyle()).getZIndex()
      },
      async setZIndex (zIndex) {
        const style = await this.resolveStyle()

        if (zIndex === style.getZIndex()) return

        style.setZIndex(zIndex)

        await this.scheduleRemount()
      },
      async getRenderer () {
        return (await this.resolveStyle()).getRenderer()
      },
      async setRenderer (renderer) {
        const style = await this.resolveStyle()

        if (renderer === style.getRenderer()) return

        style.setRenderer(renderer)

        await this.scheduleRemount()
      },
      async getGeometryFunction () {
        return (await this.resolveStyle()).getGeometryFunction()
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
      async getTextStyleTarget () {
        const style = await this.resolveStyle()

        return {
          getText: ::style.getText,
          setText: async text => {
            style.setText(text)

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
          getImage: ::style.getImage,
          setImage: async image => {
            style.setImage(image)

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
          getGeometry: ::style.getGeometry,
          setGeometry: async geometry => {
            style.setGeometry(geometry)

            if (process.env.VUELAYERS_DEBUG) {
              this.$logger.log('geometry changed, scheduling remount...')
            }

            await this.scheduleRemount()
          },
        }
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
    },
  }

  function defineServices () {
    Object.defineProperties(this, {

      /**
       * @type {Object|undefined}
       */
      $styleContainer: {
        enumerable: true,
        get: () => this.$services?.styleContainer,
      },
    })
  }
</script>
