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
        if (this.styles != null) {
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
    if (isEmpty(vm.styles)) return

    const plainFeature = feature.plain()
    if (!plainFeature.geometry) return

    const layer = feature.layer || {}

    if (isFunction(vm.styles)) {
      return vm.styles(feature, resolution)
    }

    if (Array.isArray(vm.styles)) {
      return flow(
        filter(({ style, condition }) => {
          return condition == null ||
                 (isBoolean(condition) && condition) ||
                 (
                   isFunction(condition) &&
                   condition(plainFeature, resolution, layer.id)
                 )
        }),
        map(({ style }) => style)
      )(vm.styles)
    }

    if (vm.defaultStyles != null) {
      return isFunction(vm.defaultStyles)
        ? vm.defaultStyles(feature, resolution)
        : vm.defaultStyles
    }
  }
}
