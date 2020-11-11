import { Style } from 'ol/style'
import { coalesce, hasProp, isArray, isEqual, isFunction } from '../utils'

/**
 * @typedef {
 *            module:ol/style/Style~Style |
 *            Array<module:ol/style/Style~Style> |
 *            module:ol/style/Style~StyleFunction
 *          } OlStyleLike
 */
/**
 * @typedef {Object} StyleTarget
 * @property {function(OlStyleLike|undefined): void} setStyle
 * @property {function(): OlStyleLike|undefined} getStyle
 */
/**
 * @typedef {OlStyleLike|Object} StyleLike
 */

/**
 * Style container mixin.
 */
export default {
  created () {
    this._style = undefined

    this::defineServices()
  },
  methods: {
    /**
     * @returns {{readonly styleContainer: Object}}
     * @protected
     */
    getServices () {
      const vm = this

      return {
        get styleContainer () { return vm },
      }
    },
    /**
     * Default style factory
     * @return {OlStyleLike|undefined}
     * @protected
     */
    getDefaultStyle () {},
    /**
     * Returns OL object that can be styled (i.e. has setStyle/getStyle methods) or undefined
     * @return {StyleTarget|undefined}
     * @protected
     * @abstract
     */
    getStyleTarget () {
      throw new Error(`${this.vmName} not implemented method: getStyleTarget()`)
    },
    /**
     * @return {StyleLike|undefined}
     */
    getStyle () {
      return coalesce(this.getStyleTarget()?.getStyle(), this._style)
    },
    /**
     * @param {StyleLike} style
     */
    addStyle (style) {
      if (!style) return

      const olStyle = style?.$style || style
      let currentStyle = this._style

      if (isFunction(olStyle)) {
        if (currentStyle) {
          if (process.env.NODE_ENV !== 'production') {
            this.$logger.warn('Component already has style components among its descendants. ' +
              'Avoid use of multiple vl-style-func or combining vl-style-func with vl-style-box on the same level.')
          }
        }

        currentStyle = style
      } else {
        if (!isArray(currentStyle)) {
          if (currentStyle) {
            if (process.env.NODE_ENV !== 'production') {
              this.$logger.warn('Component already has style components among its descendants. ' +
                'Avoid use of multiple vl-style-func or combining vl-style-func with vl-style-box on the same level.')
            }
          }

          currentStyle = []
        }

        if (!currentStyle.includes(olStyle)) {
          currentStyle.push(olStyle)
        }
      }

      this.setStyle(currentStyle)
    },
    /**
     * @param {StyleLike|undefined} style
     */
    removeStyle (style) {
      if (!style) return

      style = style?.$style || style
      let currentStyle = this._style

      if (currentStyle === style) {
        currentStyle = undefined
      } else if (isArray(currentStyle)) {
        currentStyle = currentStyle.filter(s => s !== style)

        if (currentStyle.length === 0) {
          currentStyle = undefined
        }
      }

      this.setStyle(currentStyle)
    },
    /**
     * @param {StyleLike|undefined} style
     */
    setStyle (style) {
      style || (style = undefined)
      if (style) {
        if (hasProp(style, '$style') || hasProp(style, '$styleFunction')) {
          style = style.$style || style.$styleFunction
        } else if (isArray(style)) {
          style = style.map(style => style?.$style || style)
        }
        if (isFunction(style)) {
          style = this.createStyleFunc(style, this.getDefaultStyle())
        } else {
          isArray(style) || (style = [style])
          style.length > 0 || (style = undefined)
        }
      }

      const styleTarget = this.getStyleTarget()
      if (styleTarget && !isEqual(style, styleTarget.getStyle())) {
        styleTarget.setStyle(style)
        this.scheduleRefresh()
      }
      if (!isEqual(style, this._style)) {
        this._style = style
        this.scheduleRefresh()
      }
    },
    /**
     * Style function factory
     * @param {StyleLike|undefined} style
     * @param {StyleLike|undefined} defaultStyle
     * @returns {module:ol/style/Style~StyleFunction}
     * @protected
     */
    createStyleFunc (style, defaultStyle) {
      return function __styleFunc (feature, resolution) {
        if (!feature.getGeometry()) return

        let compiledStyle
        if (style && isFunction(style)) {
          // style - custom ol/style/Style~StyleFunction
          compiledStyle = style(feature, resolution)
        } else if (isArray(style)) {
          // style - array of ol/style/Style objects
          compiledStyle = style.slice()
        }
        // not empty or null style
        if (
          compiledStyle == null ||
          (isArray(compiledStyle) && compiledStyle.length) ||
          compiledStyle instanceof Style
        ) {
          return compiledStyle
        }
        // fallback to default style
        if (defaultStyle) {
          return isFunction(defaultStyle) ? defaultStyle(feature, resolution) : defaultStyle
        }

        return null
      }
    },
  },
}

function defineServices () {
  Object.defineProperties(this, {
    $style: {
      enumerable: true,
      get: this.getStyle,
    },
  })
}
