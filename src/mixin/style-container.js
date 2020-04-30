import { Style } from 'ol/style'
import { constant, isArray, isFunction, reduce } from '../util/minilo'

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
 */
/**
 * @typedef {OlStyleLike|Object} StyleLike
 */

/**
 * Style container mixin.
 */
export default {
  methods: {
    /**
     * Default style factory
     * @return {OlStyleLike|undefined}
     * @protected
     */
    getDefaultStyle () {},
    /**
     * Returns OL object that can be styled (i.e. has setStyle/getStyle methods) or undefined
     * @return {Promise<StyleTarget>|StyleTarget}
     * @protected
     * @abstract
     */
    getStyleTarget () {
      throw new Error('Not implemented method: getStyleTarget')
    },
    /**
     * @return {Promise<StyleLike|undefined>}
     */
    async getStyle () {
      return (await this.getStyleTarget()).getStyle()
    },
    /**
     * @param {StyleLike} style
     * @return {Promise<void>}
     */
    async addStyle (style) {
      let currentStyle = await this.getStyle()

      let olStyle
      if (isFunction(style.resolveOlObject)) {
        olStyle = await style.resolveOlObject()
        olStyle.condition = style.conditionFunc
      } else {
        olStyle = style
        olStyle.condition = constant(true)
      }

      if (isFunction(olStyle)) {
        if (process.env.NODE_ENV !== 'production' && currentStyle) {
          this.$logger.warn('Component already has style components among it\'s descendants. ' +
            'Avoid use of multiple vl-style-func or combining vl-style-func with vl-style-box on the same level.')
        }
        currentStyle = style
      } else {
        if (!isArray(currentStyle)) {
          if (process.env.NODE_ENV !== 'production' && currentStyle) {
            this.$logger.warn('Component already has style components among it\'s descendants. ' +
              'Avoid use of multiple vl-style-func or combining vl-style-func with vl-style-box on the same level.')
          }
          currentStyle = []
        }

        if (!isArray(olStyle)) {
          olStyle = [olStyle]
        }

        olStyle.forEach(style => {
          if (!currentStyle.includes(style)) {
            currentStyle.push(style)
          }
        })
      }

      await this.setStyle(currentStyle)
    },
    /**
     * @param {StyleLike|undefined} style
     * @return {Promise<void>}
     */
    async removeStyle (style) {
      let currentStyle = await this.getStyle()

      if (isFunction(style.resolveOlObject)) {
        style = await style.resolveOlObject()
      }

      if (currentStyle === style) {
        currentStyle = null
      } else if (isArray(currentStyle)) {
        currentStyle = currentStyle.filter(s => s !== style)

        if (currentStyle.length === 0) {
          currentStyle = null
        }
      }

      await this.setStyle(currentStyle)
    },
    /**
     * @param {StyleLike|undefined} style
     * @return {void}
     */
    async setStyle (style) {
      if (isFunction(style.resolveOlObject)) {
        style = await style.resolveOlObject()
      }

      const styleTarget = await this.getStyleTarget()
      if (!styleTarget) return

      if (style) {
        styleTarget.setStyle(this.createStyleFunc(style, this.getDefaultStyle()))
      } else {
        styleTarget.setStyle(null)
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
      return function __styleTargetStyleFunc (feature, resolution) {
        if (!feature.getGeometry()) return

        if (style && isFunction(style)) {
          // style - custom ol/style/Style~StyleFunction
          style = style(feature, resolution)
        } else if (isArray(style)) {
          // style - array of ol/style/Style objects
          style = reduce(style, (newStyle, curStyle) => {
            if (
              newStyle.condition == null ||
              (newStyle.condition === true) ||
              (isFunction(newStyle.condition) && newStyle.condition(feature, resolution))
            ) {
              newStyle.push(curStyle)
            }
            return newStyle
          }, [])
        }
        // not empty or null style
        if (
          style === null ||
          (isArray(style) && style.length) ||
          style instanceof Style
        ) {
          return style
        }
        // fallback to default style
        if (defaultStyle) {
          return isFunction(defaultStyle) ? defaultStyle(feature, resolution) : defaultStyle
        }

        return null
      }
    },
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
  },
}
