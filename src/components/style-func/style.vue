<script>
  import { Style } from 'ol/style'
  import {
    makeChangeOrRecreateWatchers,
    olCmp,
    projTransforms,
    stubVNode,
    styleContainer,
    waitForMap,
  } from '../../mixins'
  import { EPSG_3857 } from '../../ol-ext'
  import { mergeDescriptors } from '../../utils'

  /**
   * Style function component for advanced styling.
   * Plays the role of both a style that mounts itself to style target component (vl-layer-vector, vl-feature & etc.)
   * and style target for inner style containers (vl-style-box) as fallback style.
   */
  export default {
    name: 'VlStyleFunc',
    mixins: [
      stubVNode,
      projTransforms,
      styleContainer,
      olCmp,
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
       * @type {function(): function(feature: Feature): Style}
       */
      function: {
        type: Function,
        // required: true,
      },
      /**
       * @deprecated
       * @todo remove later
       */
      func: Function,
      /**
       * @deprecated Use `func` prop instead.
       * @todo remove in v0.13.x
       */
      factory: Function,
    },
    data () {
      return {
        viewProjection: EPSG_3857,
        dataProjection: EPSG_3857,
      }
    },
    computed: {
      inputFunction () {
        let func = this.function || this.func
        if (!func && this.factory) {
          func = this.factory()
        }

        return func
      },
    },
    watch: {
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'inputFunction',
      ]),
    },
    created () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.factory) {
          this.$logger.warn("'factory' prop is deprecated. Use 'function' prop instead.")
        }
        if (this.func) {
          this.$logger.warn("'func' prop is deprecated. Use 'function' prop instead.")
        }
      }

      this::defineServices()
    },
    updated () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.factory) {
          this.$logger.warn("'factory' prop is deprecated. Use 'function' prop instead.")
        }
        if (this.func) {
          this.$logger.warn("'func' prop is deprecated. Use 'function' prop instead.")
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
          this::olCmp.methods.beforeInit(),
          this::waitForMap.methods.beforeInit(),
        ])
      },
      /**
       * @return {function(feature: Feature): Style}
       * @protected
       */
      createOlObject () {
        // user provided style function
        const providedStyleFunc = this.inputFunction
        // fallback style function made from inner style containers
        const fallbackStyleFunc = this.createStyleFunc(this.$style, this.getDefaultStyle())

        const func = function __styleFunc (feature, resolution) {
          const style = providedStyleFunc(feature, resolution)
          // not empty or null style
          if (
            style == null ||
            (Array.isArray(style) && style.length) ||
            style instanceof Style
          ) {
            return style
          }
          return fallbackStyleFunc(feature, resolution)
        }
        func.id = this.currentId

        return func
      },
      /**
       * @returns {Object}
       * @protected
       */
      getServices () {
        return mergeDescriptors(
          this::olCmp.methods.getServices(),
          this::styleContainer.methods.getServices(),
        )
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async mount () {
        this.$styleContainer?.setStyle(this)

        return this::olCmp.methods.mount()
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async unmount () {
        if (this.$styleContainer?.getStyle() === this.$styleFunction) {
          this.$styleContainer.setStyle(null)
        }

        return this::olCmp.methods.unmount()
      },
      /**
       * @protected
       */
      getStyleTarget () {
        return {
          getStyle: () => this._style,
          setStyle: async () => {
            if (process.env.VUELAYERS_DEBUG) {
              this.$logger.log('style changed, scheduling recreate...')
            }

            await this.scheduleRecreate()
          },
        }
      },
    },
  }

  function defineServices () {
    Object.defineProperties(this, {
      $styleFunction: {
        enumerable: true,
        get: () => this.$olObject,
      },
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
