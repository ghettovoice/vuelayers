import debounce from 'debounce-promise'
import { Style } from 'ol/style'
import { dumpStyle } from '../ol-ext'
import { clonePlainObject, isArray, isEqual, isFunction } from '../utils'
import { FRAME_TIME } from './ol-cmp'

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
  computed: {
    currentStyle () {
      if (!(this.rev && this.$style)) return

      let style = this.$style
      if (isFunction(style)) return style
      if (!style) return

      isArray(style) || (style = [style])

      return style.map(style => dumpStyle(style, geom => this.writeGeometryInDataProj(geom)))
    },
  },
  watch: {
    currentStyle: {
      deep: true,
      handler: /*#__PURE__*/debounce(function (value, prev) {
        if (isEqual(value, prev)) return

        this.$emit('update:style', value && clonePlainObject(value))
      }, FRAME_TIME),
    },
  },
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
     * @return {Promise<StyleTarget>|StyleTarget}
     * @protected
     * @abstract
     */
    getStyleTarget () {
      throw new Error(`${this.vmName} not implemented method: getStyleTarget()`)
    },
    /**
     * @return {StyleLike|null}
     */
    getStyle () {
      return this._style
    },
    /**
     * @param {StyleLike} style
     * @return {Promise<void>}
     */
    async addStyle (style) {
      if (!style) return

      let olStyle
      if (isFunction(style.resolveOlObject)) {
        olStyle = await style.resolveOlObject()
      } else {
        olStyle = style
      }

      let currentStyle = this.$style

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

      await this.setStyle(currentStyle)
    },
    /**
     * @param {StyleLike|undefined} style
     * @return {Promise<void>}
     */
    async removeStyle (style) {
      if (!style) return

      if (isFunction(style.resolveOlObject)) {
        style = await style.resolveOlObject()
      }

      let currentStyle = this.$style
      if (currentStyle === style) {
        currentStyle = undefined
      } else if (isArray(currentStyle)) {
        currentStyle = currentStyle.filter(s => s !== style)

        if (currentStyle.length === 0) {
          currentStyle = undefined
        }
      }

      await this.setStyle(currentStyle)
    },
    /**
     * @param {StyleLike|undefined} style
     * @return {void}
     */
    async setStyle (style) {
      if (style) {
        if (isFunction(style.resolveOlObject)) {
          style = await style.resolveOlObject()
        } else if (isArray(style)) {
          style = await Promise.all(style.map(async style => {
            if (isFunction(style.resolveOlObject)) {
              return style.resolveOlObject()
            }
            return style
          }))
        }
      }
      style || (style = undefined)

      if (isEqual(style, this._style)) return

      const styleTarget = await this.getStyleTarget()
      if (!styleTarget) return

      if (style) {
        if (isFunction(style)) {
          style = this.createStyleFunc(style, this.getDefaultStyle())
        } else {
          isArray(style) || (style = [style])
          style.length > 0 || (style = undefined)
        }
      } else {
        style = undefined
      }

      this._style = style
      await styleTarget.setStyle(style)
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
