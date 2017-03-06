import { isFunction, kebabCase } from 'lodash/fp'

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
    styleTarget () { },
    setStyle (style) {
      this.styles = style
      const styleTarget = this.styleTarget()

      if (styleTarget) {
        if (this.styles && this.styles.length) {
          styleTarget.setStyle(
            isFunction(this.styles)
              ? this.styles
              : createStyleFunc(this)
          )
        } else {
          styleTarget.setStyle(undefined)
        }
        this.refresh()
      }
    },
    getStyle () {
      return this.styles || []
    }
  }
}
// todo implement removed, aka null style
export function createStyleFunc (vm) {
  return function __styleTargetStyleFunc (feature, resolution) {
    if (!vm.styles || !vm.styles.length) return null

    const plainFeature = feature.$vm ? feature.$vm.plain() : feature.getProperties()
    if (!plainFeature.geometry) return null

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
