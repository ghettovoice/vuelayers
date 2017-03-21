import ol from 'openlayers'
import { isEmpty, isFunction, isBoolean, flow, map, filter } from 'vl-utils/func'

export default {
  provide () {
    return {
      setStyle: ::this.setStyle,
      getStyle: ::this.getStyle
    }
  },
  beforeCreate () {
    /**
     * @type {ol.style.Style[]|ol.StyleFunction|undefined}
     */
    this.styles = this.defaultStyles = undefined
  },
  methods: {
    /**
     * Returns styleable OpenLayers object
     *
     * @protected
     */
    styleTarget () { },
    setStyle (style) {
      this.styles = style
      const styleTarget = this.styleTarget()

      if (styleTarget) {
        if (this.styles === null || this.styles) {
          styleTarget.setStyle(createStyleFunc(this))
        } else {
          styleTarget.setStyle(undefined)
        }
      }
    },
    getStyle () {
      return this.styles
    }
  }
}

export function createStyleFunc (vm) {
  return function __styleTargetStyleFunc (feature, resolution) {
    if (!feature.getGeometry()) return

    let styles = vm.styles

    if (isFunction(styles)) {
      styles = styles(feature, resolution, feature.layer, ol)
    } else if (Array.isArray(styles)) {
      styles = flow(
        filter(({ style, condition }) => {
          return condition == null ||
                 (isBoolean(condition) && condition) ||
                 (
                   isFunction(condition) &&
                   condition(feature, resolution, feature.layer, ol)
                 )
        }),
        map(({ style }) => style)
      )(styles)
    }
    // null style
    if (styles === null || !isEmpty(styles)) return styles

    if (vm.defaultStyles) {
      return isFunction(vm.defaultStyles)
        ? vm.defaultStyles(feature, resolution, feature.layer, ol)
        : vm.defaultStyles
    }
  }
}
