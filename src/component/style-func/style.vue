<script>
  import { Style } from 'ol/style'
  import { style, stylesContainer } from '../../mixin'
  import { hasMap } from '../../util/assert'
  import { warn } from '../../util/log'
  import { isFunction, noop } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'

  /**
   * Style function component for advanced styling.
   * Plays the role of both a style that mounts itself to style target component (vl-layer-vector, vl-feature & etc.)
   * and style target for inner style containers (vl-style-box) as fallback style.
   */
  export default {
    name: 'vl-style-func',
    mixins: [style, stylesContainer],
    stubVNode: {
      empty: false,
      attrs () {
        return {
          id: this.vmId,
          class: this.cmpName,
        }
      },
    },
    props: {
      /**
       * @type {function(): function(feature: Feature): Style}
       */
      factory: {
        type: Function,
        required: true,
      },
    },
    computed: {
      styleFunc () {
        let func = this.factory()
        if (!isFunction(func)) {
          if (process.env.NODE_ENV !== 'production') {
            warn(`Factory returned a value not of Function type, fallback style will be used`)
          }
          func = noop
        }

        return func
      },
    },
    methods: {
      /**
       * @return {function(feature: Feature): Style}
       * @protected
       */
      createStyle () {
        hasMap(this)
        // user provided style function
        const providedStyleFunc = this.styleFunc
        // fallback style function made from inner style containers
        const fallbackStyleFunc = this.createStyleFunc()

        return function __styleFunc (feature, resolution) {
          const styles = providedStyleFunc(feature, resolution)
          // not empty or null style
          if (
            styles === null ||
            (Array.isArray(styles) && styles.length) ||
            styles instanceof Style
          ) {
            return styles
          }
          return fallbackStyleFunc(feature, resolution)
        }
      },
      /**
       * @return {void}
       * @protected
       */
      mount () {
        this.$stylesContainer && this.$stylesContainer.addStyle(this)
      },
      /**
       * @return {void}
       * @protected
       */
      unmount () {
        this.$stylesContainer && this.$stylesContainer.removeStyle(this)
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
       * Overrides stylesContainer `setStyle` method
       * @param {Array<{ style: Style, condition: (function|boolean|undefined) }>|function(feature: Feature): Style|Vue|undefined} styles
       * @return {void}
       */
      setStyle (styles) {
        if (styles !== this._styles) {
          // simply save all inner styles and
          // use them later in style function as fallback
          this._styles = styles
          this.scheduleRefresh()
        }
      },
      /**
       * @return {Promise}
       */
      refresh () {
        // recreate style
        return this.recreate()
      },
    },
    watch: {
      factory () {
        this.scheduleRefresh()
      },
    },
  }
</script>
