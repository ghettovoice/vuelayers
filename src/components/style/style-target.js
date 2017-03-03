import { isBoolean, isFunction, isString, flow, filter, map } from 'lodash/fp'

export const filterStyles = (feature, resolution) => flow(
  filter(([ style, condition ]) => {
    if (isString(condition)) {
      // eslint-disable-next-line no-new-func
      condition = new Function('feature', 'resolution', 'return ' + condition)
    }

    return isBoolean(condition) && condition ||
           isFunction(condition) && condition(feature, resolution)
  }),
  map(([ style ]) => style)
)

export default {
  beforeCreate () {
    this.styles = []
  },
  methods: {
    setStyle (style) {
      this.styles = style

      if (this.layer) {
        if (this.styles && this.styles.length) {
          this.layer.setStyle((feature, resolution) => filterStyles(feature.$vm.plain(), resolution)(this.styles))
        } else {
          this.layer.setStyle(undefined)
        }
        this.refresh()
      }
    },
    getStyle () {
      return this.styles || []
    }
  }
}
