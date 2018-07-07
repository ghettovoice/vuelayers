import Vue from 'vue'
import { warn } from '../util/log'
import { isFunction, reduce } from '../util/minilo'

export default {
  created () {
    /**
     * @type {Style[]|StyleFunction|Vue|undefined}
     * @private
     */
    this._styles = undefined
  },
  methods: {
    /**
     * Default style factory
     * @return {Style[]|StyleFunction|undefined}
     * @protected
     */
    getDefaultStyles () {},
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return {
        get stylesContainer () { return vm },
      }
    },
    /**
     * @return {Style[]|StyleFunction|Vue|undefined}
     */
    getStyles () {
      return this._styles
    },
    /**
     * @param {Style|StyleFunction|Vue|undefined} style
     * @return {void}
     */
    addStyle (style) {
      let currentStyles = this.getStyles()
      let olStyle = style instanceof Vue ? style.$style : style

      if (isFunction(olStyle)) {
        if (process.env.NODE_ENV !== 'production' && currentStyles) {
          warn('Component already has style components among it\'s descendants. ' +
            'Avoid use of multiple vl-style-func or combining vl-style-func with vl-style-box on the same level')
        }
        currentStyles = style
      } else {
        if (!Array.isArray(currentStyles)) {
          if (process.env.NODE_ENV !== 'production' && currentStyles) {
            warn('Component already has style components among it\'s descendants. ' +
              'Avoid use of multiple vl-style-func or combining vl-style-func with vl-style-box on the same level')
          }
          currentStyles = []
        }
        style = style instanceof Vue ? style : { $style: style, condition: true }
        if (!currentStyles.includes(style)) {
          currentStyles.push(style)
        }
      }

      this.setStyle(currentStyles)
    },
    /**
     * @param {Array<{style: Style, condition: (function|boolean|undefined)}>|StyleFunction|Vue|undefined} styles
     * @return {void}
     */
    setStyle (styles) {
      if (styles === this._styles) return
      this._styles = styles

      const styleTarget = this.getStyleTarget()
      if (!styleTarget) return

      if (this._styles === null || this._styles) {
        styleTarget.setStyle(this.createStyleFunc())
      } else {
        styleTarget.setStyle(undefined)
      }
    },
    /**
     * @param {Style|StyleFunction|Vue|undefined} style
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
            : s.$style !== style
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
     * @returns {StyleFunction}
     * @protected
     */
    createStyleFunc () {
      const vm = this
      const defaultStyles = this.getDefaultStyles()

      return function __styleTargetStyleFunc (feature, resolution) {
        if (!feature.getGeometry()) return
        let styles = vm.getStyles()
        /* eslint-disable brace-style */
        // handle provided styles
        // styles - StyleFunction or vl-style-func
        if (styles && (isFunction(styles) || isFunction(styles.$style))) {
          let styleFunc = isFunction(styles) ? styles : styles.$style
          styles = styleFunc(feature, resolution)
        }
        // styles is array of { $style: Style, condition: (bool|function():bool) }
        else if (Array.isArray(styles)) {
          styles = reduce(styles, (newStyles, { $style, condition }) => {
            if (
              condition == null ||
              (condition === true) ||
              (
                isFunction(condition) &&
                condition(feature, resolution)
              )
            ) {
              newStyles.push($style)
            }
            return newStyles
          }, [])
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
        styles = defaultStyles
        if (styles) {
          return isFunction(styles)
            ? styles(feature, resolution)
            : styles
        }
      }
    },
  },
}
