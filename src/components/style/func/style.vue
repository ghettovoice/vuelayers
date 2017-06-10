<script>
  /**
   * Style function component for advanced styling.
   * Plays the role of both a style that mounts itself to style target component (vl-layer-vector, vl-feature & etc.)
   * and style target for inner style containers (vl-style-box) as fallback style.
   */
  import { isFunction, noop } from 'lodash/fp'
  import { style as styleHelper } from '../../../ol-ext'
  import { warndbg } from '../../../utils/debug'
  import style from '../style'
  import styleTarget from '../../style-target'
  import { assertHasMap } from '../../../utils/assert'

  const props = {
    factory: {
      type: Function,
      required: true
    }
  }

  const methods = {
    /**
     * @return {ol.StyleFunction}
     * @protected
     */
    createStyle () {
      assertHasMap(this)
      // user provided style function
      let providedStyleFunc = this.factory(styleHelper)
      if (!isFunction(providedStyleFunc)) {
        warndbg(`Factory returned a value not of Function type, fallback style will be used`)
        providedStyleFunc = noop
      }
      // fallback style function made from inner style containers
      const fallbackStyleFunc = this.createStyleFunc()

      return function __styleFunc (feature, resolution, helper) {
        const styles = providedStyleFunc(feature, resolution, helper)
        // not empty or null style
        if (
          styles === null ||
          (Array.isArray(styles) && styles.length)
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
      this.$parent.addStyle(this)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.$parent.removeStyle(this)
    },
    /**
     * Overrides style-target `setStyle` method
     * @return {void}
     */
    setStyle (style) {
      // simply save all inner styles and
      // use them later in style function as fallback
      this.styles = style
      this.requestRefresh()
    },
    /**
     * @return {void}
     */
    refresh () {
      // recreate style
      this.unmount()
      this.deinit()
      this.init()
      this.mount()
    }
  }

  const watch = {
    factory () {
      this.requestRefresh()
    }
  }

  export default {
    name: 'vl-style-func',
    mixins: [style, styleTarget],
    props,
    methods,
    watch,
    stubVNode: {
      empty: false,
      attrs () {
        return {
          id: this.$options.name
        }
      }
    }
  }
</script>
