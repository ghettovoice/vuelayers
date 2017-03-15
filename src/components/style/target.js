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
    const plainFeature = feature.plain()
    if (!plainFeature.geometry) return

    const layer = feature.layer || {}
    let styles = vm.styles

    if (isFunction(styles)) {
      styles = styles(feature, resolution)
    } else if (Array.isArray(styles)) {
      styles = flow(
        filter(({ style, condition }) => {
          return condition == null ||
                 (isBoolean(condition) && condition) ||
                 (
                   isFunction(condition) &&
                   condition(plainFeature, resolution, layer.id)
                 )
        }),
        map(({ style }) => style)
      )(styles)
    }

    // null style
    if (styles === null || !isEmpty(styles)) return styles

    if (vm.defaultStyles) {
      return isFunction(vm.defaultStyles)
        ? vm.defaultStyles(feature, resolution)
        : vm.defaultStyles
    }
  }
}
