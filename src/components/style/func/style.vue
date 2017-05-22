<script>
  /**
   * Style function component for advanced styling.
   * Plays the role of both a style that mounts itself to style target (layer, feature & etc.)
   * and style target for inner style containers.
   */
  import { partialRight } from 'lodash/fp'
  import { geoJson, styleHelper, geomHelper, coordHelper } from '../../../ol-ext'
  import { warndbg } from '../../../utils/debug'
  import style from '../style'
  import styleTarget, { createStyleFunc } from '../../style-target'
  import { assertHasStyleTarget, assertHasView } from '../../../utils/assert'

  const props = {
    factory: {
      type: Function,
      required: true
    }
  }

  const methods = {
    /**
     * @return {void}
     */
    refresh () {
      this.unmount()
      // recreate style function
      this.initialize()
      this.mount()
    },
    // protected & private
    /**
     * @return {ol.StyleFunction}
     * @protected
     */
    createStyle () {
      assertHasView(this)
      // replace styleHelper.geom method with partially applied version
      const helper = {
        ...styleHelper,
        ...geomHelper,
        ...coordHelper,
        geom: partialRight(styleHelper.geom, [this.view.getProjection()]),
        geoJson
      }
      // fallback style function made from inner style containers
      const fallbackStyleFunc = createStyleFunc(this)
      // user provided style function
      let providedStyleFunc = this.factory(helper)
      let type = typeof providedStyleFunc
      if (type !== 'function') {
        warndbg(`Style function factory returned value is of type ${type}, expected type is Function`)
        providedStyleFunc = () => {}
      }

      return function __styleFunc (feature, resolution, helper) {
        const styles = providedStyleFunc(
          feature,
          resolution,
          helper
        )

        if (styles === null || (Array.isArray(styles) && styles.length)) return styles

        return fallbackStyleFunc(feature, resolution)
      }
    },
    /**
     * Overrides style-target `setStyle` method
     * @return {void}
     */
    setStyle (style) {
      // simply save all inner styles and
      // use them later in style function as fallback
      this.styles = style
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      assertHasStyleTarget(this)

      let currentStyle = this.styleTarget.getStyle()
      if (currentStyle) {
        warndbg('Style target already has defined style. Avoid use of multiple vl-style-func or ' +
          'combining vl-style-func and vl-style-container components on the same level')
      }
      this.styleTarget.setStyle(this.style)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      assertHasStyleTarget(this)
      this.styleTarget.setStyle(undefined)
    }
  }

  const watch = {
    factory () {
      this.deferRefresh()
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
