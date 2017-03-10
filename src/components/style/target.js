import { isFunction, kebabCase } from 'vl-utils/func'

export default {
  provide () {
    return {
      setStyle: ::this.setStyle,
      getStyle: ::this.getStyle
    }
  },
  beforeCreate () {
    this.styles = []
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
        if (this.styles === null || (Array.isArray(this.styles) && this.styles.length)) {
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
    if (vm.styles === null) return null
    if (!vm.styles.length) return

    const plainFeature = feature.plain()
    if (!plainFeature.geometry) return

    const styles = []
    vm.styles.forEach(({ style, geomType }) => {
      if (
        geomType == null || plainFeature.geometry.type === geomType ||
        kebabCase(feature.geometry.type) === geomType
      ) {
        styles.push(style)
      }
    })

    return styles
  }
}
