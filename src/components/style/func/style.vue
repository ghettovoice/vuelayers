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
  import * as assert from '../../../utils/assert'

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
      assert.hasMap(this)
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
      this.$parent && this.$parent.addStyle(this)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.$parent && this.$parent.removeStyle(this)
    },
    /**
     * Overrides style-target `setStyle` method
     * @param {Array<{ style: ol.style.Style, condition: (function|boolean|undefined) }>|ol.StyleFunction|Vue|undefined} styles
     * @return {void}
     */
    setStyle (styles) {
      if (styles !== this._styles) {
        // simply save all inner styles and
        // use them later in style function as fallback
        this._styles = styles
        this.requestRefresh()
      }
    },
    /**
     * @return {Promise}
     */
    refresh () {
      // recreate style
      return Promise.resolve(this.unmount())
        .then(this.deinit)
        .then(this.init)
        .then(this.mount)
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
          class: this.$options.name
        }
      }
    }
  }
</script>
