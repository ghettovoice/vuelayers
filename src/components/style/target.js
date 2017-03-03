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
          styleTarget.setStyle(isFunction(this.styles) ? this.styles : createStyleFunc(this.styles))
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
  return (feature, resolution) => flow(
    filter(([ style, condition ]) => {
      if (condition == null) return style

      if (condition != null && isString(condition)) {
        // eslint-disable-next-line no-new-func
        condition = new Function('feature', 'resolution', `;return ${condition};`)
      }

      return isBoolean(condition) && condition ||
             isFunction(condition) && condition(feature, resolution)
    }),
    map(([ style ]) => style)
  )(styles)
}

export function createStyleFunc (styles) {
  const styleFilter = createStylesFilter(styles)

  return (feature, resolution) => styleFilter(feature.$vm.plain(), resolution)
}
