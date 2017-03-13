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
    this.styles = undefined
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
        if (
          isFunction(this.styles) ||
          (Array.isArray(this.styles) && this.styles.length)
        ) {
          styleTarget.setStyle(
            isFunction(this.styles)
              ? this.styles
              : createStyleFunc(this)
          )
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

    const layer = feature.layer

    return flow(
      filter(({ style, condition }) => {
        return condition == null ||
               (isBoolean(condition) && condition) ||
               (isFunction(condition) && condition(plainFeature, resolution, layer && layer.id))
      }),
      map(({ style }) => style)
    )(vm.styles)
  }
}
