/**
 * @module components/style-target
 */
import Vue from 'vue'
import { filter, flow, isFunction, map } from 'lodash/fp'
import { style as styleHelper } from '../ol-ext'
import { assertHasMap } from '../utils/assert'
import { warndbg } from '../utils/debug'

export default {
  beforeCreate () {
    /**
     * @type {ol.style.Style[]|ol.StyleFunction|Vue|undefined}
     * @private
     */
    this.styles = undefined
  },
  methods: {
    /**
     * @return {ol.style.Style[]|ol.StyleFunction|Vue|undefined}
     */
    getStyles () {
      return this.styles
    },
    /**
     * @return {ol.style.Style[]|ol.StyleFunction|undefined}
     * @protected
     */
    getDefaultStyles () {},
    /**
     * @param {ol.style.Style|ol.StyleFunction|Vue|undefined} style
     * @return {void}
     */
    addStyle (style) {
      let currentStyles = this.getStyles()
      let olStyle = style instanceof Vue ? style.style : style

      if (isFunction(olStyle)) {
        if (currentStyles) {
          warndbg('Component already has style components among it\'s descendants. ' +
            'Avoid use of multiple vl-style-func or combining vl-style-func with vl-style-box on the same level')
        }
        currentStyles = style
      } else {
        if (!Array.isArray(currentStyles)) {
          if (currentStyles) {
            warndbg('Component already has style components among it\'s descendants. ' +
              'Avoid use of multiple vl-style-func or combining vl-style-func with vl-style-box on the same level')
          }
          currentStyles = []
        }
        currentStyles = currentStyles.concat(style instanceof Vue ? style : { style, condition: true })
      }

      this.setStyle(currentStyles)
    },
    /**
     * @param {Array<{style: ol.style.Style, condition: (function|boolean|undefined)}>|ol.StyleFunction|Vue|undefined} styles
     * @return {void}
     */
    setStyle (styles) {
      this.styles = styles

      const styleTarget = this.getStyleTarget()
      if (!styleTarget) return

      if (this.styles === null || this.styles) {
        styleTarget.setStyle(this.createStyleFunc())
      } else {
        styleTarget.setStyle(undefined)
      }
    },
    /**
     * @param {ol.style.Style|ol.StyleFunction|Vue|undefined} style
     * @return {void}
     */
    removeStyle (style) {
      let currentStyles = this.getStyles()

      if (currentStyles === style) {
        currentStyles = undefined
      } else if (Array.isArray(currentStyles)) {
        currentStyles = currentStyles.filter(s => {
          return style instanceof Vue
            ? s !== style
            : s.style !== style
        })
        currentStyles.length || (currentStyles = undefined)
      }

      this.setStyle(currentStyles)
    },
    /**
     * Returns OL object that can be styled (i.e. has setStyle/getStyle methods) or undefined
     * @return {*}
     * @protected
     * @abstract
     */
    getStyleTarget () {
      throw new Error('Not implemented method')
    },
    /**
     * Style function factory
     * @returns {ol.StyleFunction}
     * @protected
     */
    createStyleFunc () {
      const vm = this

      return function __styleTargetStyleFunc (feature, resolution) {
        assertHasMap(vm)

        if (!feature.getGeometry()) return

        let styles = vm.getStyles()
        /* eslint-disable brace-style */
        // handle provided styles
        // styles - ol.StyleFunction or vl-style-func
        if (isFunction(styles) || isFunction(styles.style)) {
          let styleFunc = isFunction(styles) ? styles : styles.style
          styles = styleFunc(feature, resolution, styleHelper)
        }
        // styles is array of ol.style.Style or vl-style-box
        else if (Array.isArray(styles)) {
          styles = flow(
            filter(({ condition }) => {
              return condition == null ||
                (condition === true) ||
                (
                  isFunction(condition) &&
                  condition(feature, resolution)
                )
            }),
            map('style')
          )(styles)
        }
        /* eslint-enable brace-style */
        // not empty or null style
        if (
          styles === null ||
          (Array.isArray(styles) && styles.length)
        ) {
          return styles
        }
        // fallback to default style
        styles = vm.getDefaultStyles()
        if (styles) {
          return isFunction(styles)
            ? styles(feature, resolution, styleHelper)
            : styles
        }
      }
    }
  }
}
