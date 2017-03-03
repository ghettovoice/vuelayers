import { isBoolean, isFunction, isString, flow, filter, map } from 'lodash/fp'

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
          console.log(this._name)
          styleTarget.setStyle(
            isFunction(this.styles)
              ? this.styles
              : createStyleFunc(this.styles, styleTarget)
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

export function createStylesFilter (styles) {
  return (featureData, resolution) => flow(
    filter(([ style, condition ]) => {
      if (condition == null) return style

      if (condition != null && isString(condition)) {
        // eslint-disable-next-line no-new-func
        condition = new Function('feature', 'resolution', `return ${condition}`)
      }

      return isBoolean(condition) && condition ||
             isFunction(condition) && condition(featureData, resolution)
    }),
    map(([ style ]) => style)
  )(styles)
}

export function createStyleFunc (styles, styleTarget) {
  const styleTargetStylesFilter = createStylesFilter(styles)

  return function __styleTargetStyleFunc (feature, resolution) {
    console.log(feature.$vm.styles)
    // apply feature level styles
    if (feature.$vm && feature.$vm.styles && feature.$vm.styles.length) {
      const featureStylesFilter = createStylesFilter(feature.$vm.styles)

      return featureStylesFilter(feature.$vm.plain(), resolution)
    }

    return styleTargetStylesFilter(
      feature.$vm
        ? feature.$vm.plain()
        : feature.getProperties(),
      resolution
    )
  }
}
