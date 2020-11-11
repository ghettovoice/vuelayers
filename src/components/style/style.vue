<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <slot>
      <CircleStyle :id="'vl-' + currentId + '-default-circle-style'" />
      <FillStyle :id="'vl-' + currentId + '-default-fill-style'" />
      <StrokeStyle :id="'vl-' + currentId + '-default-stroke-style'" />
    </slot>
  </i>
</template>

<script>
  import { Style } from 'ol/style'
  import {
    fillStyleContainer,
    geometryContainer,
    imageStyleContainer,
    projTransforms,
    strokeStyleContainer,
    style,
    textStyleContainer,
    waitForMap,
  } from '../../mixins'
  import { dumpFillStyle, dumpImageStyle, dumpStrokeStyle, dumpTextStyle, EPSG_3857 } from '../../ol-ext'
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
      projTransforms,
      fillStyleContainer,
      strokeStyleContainer,
      textStyleContainer,
      imageStyleContainer,
      geometryContainer,
      style,
      waitForMap,
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
    data () {
      return {
        viewProjection: EPSG_3857,
        dataProjection: EPSG_3857,
        currentZIndex: this.zIndex,
        currentRenderer: this.renderer,
      }
    },
    computed: {
      stroke () {
        if (!(this.rev && this.$stroke)) return

        return dumpStrokeStyle(this.$stroke)
      },
      fill () {
        if (!(this.rev && this.$fill)) return

        return dumpFillStyle(this.$fill)
      },
      text () {
        if (!(this.rev && this.$text)) return

        return dumpTextStyle(this.$text)
      },
      image () {
        if (!(this.rev && this.$image)) return

        return dumpImageStyle(this.$image)
      },
      geometryDataProj () {
        if (!(this.rev && this.$geometry)) return

        return this.writeGeometryInDataProj(this.$geometry)
      },
      geometryViewProj () {
        if (!(this.rev && this.$geometry)) return

        return this.writeGeometryInViewProj(this.$geometry)
      },
    },
    watch: {
      rev () {
        if (!this.$style) return

        this.setZIndex(this.getZIndex())
        this.setRenderer(this.getRenderer())
      },
      .../*#__PURE__*/makeWatchers([
        'zIndex',
        'renderer',
      ], inProp => {
        const prop = inProp.slice(0, 5) === 'input' ? lowerFirst(inProp.slice(5)) : inProp
        const setter = 'set' + upperFirst(prop)

        return function (value) {
          this[setter](value)
        }
      }),
      .../*#__PURE__*/makeWatchers([
        'currentZIndex',
        'currentRenderer',
      ], curProp => {
        const prop = curProp.slice(0, 7) === 'current' ? lowerFirst(curProp.slice(7)) : curProp
        const inProp = 'input' + upperFirst(prop)

        return function (value) {
          if (isEqual(value, coalesce(this[inProp], this[prop]))) return

          this.$emit(`update:${prop}`, isObjectLike(value) ? clonePlainObject(value) : value)
        }
      }),
      .../*#__PURE__*/makeWatchers([
        'fill',
        'stroke',
        'text',
        'image',
        'geometryDataProj',
      ], prop => {
        prop = prop.replace(/(DataProj|ViewProj)$/i, '')

        return {
          deep: true,
          handler (value, prev) {
            if (isEqual(value, prev)) return

            this.$emit(`update:${prop}`, isObjectLike(value) ? clonePlainObject(value) : value)
          },
        }
      }),
    },
    created () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.condition) {
          this.$logger.warn("'condition' is deprecated. Use v-if directive instead.")
        }
      }

      this::defineServices()
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
       * @return {Promise<void>}
       * @protected
       */
      async beforeInit () {
        await Promise.all([
          this::style.methods.beforeInit(),
          this::waitForMap.methods.beforeInit(),
        ])
      },
      /**
       * @return {module:ol/style/Style~Style}
       * @protected
       */
      createStyle () {
        return new Style({
          zIndex: this.currentZIndex,
          renderer: this.currentRenderer,
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
        this.$styleContainer?.addStyle(this)

        return this::style.methods.mount()
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async unmount () {
        this.$styleContainer?.removeStyle(this)

        return this::style.methods.unmount()
      },
      /**
       * @return {Promise}
       */
      async refresh () {
        await Promise.all([
          this::style.methods.refresh(),
          this.$styleContainer?.refresh(),
        ])
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
      /**
       * @protected
       */
      syncNonObservable () {
        this::style.methods.syncNonObservable()

        this.setZIndex(this.getZIndex())
        this.setRenderer(this.getRenderer())
      },
      getFillStyleTarget () {
        return this.$style
      },
      getStrokeStyleTarget () {
        return this.$style
      },
      getTextStyleTarget () {
        return this.$style
      },
      getImageStyleTarget () {
        return this.$style
      },
      getGeometryTarget () {
        return this.$style
      },
      getZIndex () {
        return coalesce(this.$style?.getZIndex(), this.currentZIndex)
      },
      setZIndex (zIndex) {
        if (zIndex !== this.currentZIndex) {
          this.currentZIndex = zIndex
          this.scheduleRefresh()
        }
        if (this.$style && zIndex !== this.$style.getZIndex()) {
          this.$style.setZIndex(zIndex)
          this.scheduleRefresh()
        }
      },
      getRenderer () {
        return coalesce(this.$style?.getRenderer(), this.currentRenderer)
      },
      setRenderer (renderer) {
        if (renderer !== this.currentRenderer) {
          this.currentRenderer = renderer
          this.scheduleRefresh()
        }
        if (this.$style && renderer !== this.$style.getRenderer()) {
          this.$style.setRenderer(renderer)
          this.scheduleRefresh()
        }
      },
      // todo add support for geometry function
      getGeometryFunction () {
        return this.$style?.getGeometryFunction()
      },
    },
  }

  function defineServices () {
    Object.defineProperties(this, {
      /**
       * @type {Object|undefined}
       */
      $mapVm: {
        enumerable: true,
        get: () => this.$services?.mapVm,
      },
      /**
       * @type {Object|undefined}
       */
      $viewVm: {
        enumerable: true,
        get: () => this.$services?.viewVm,
      },
    })
  }
</script>
