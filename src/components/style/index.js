import { pick } from '../../utils'
import CircleStyle from './circle.vue'
import FillStyle from './fill.vue'
import IconStyle from './icon.vue'
import RegShapeStyle from './reg-shape.vue'
import StrokeStyle from './stroke.vue'
import Style from './style.vue'
import TextStyle from './text.vue'

function plugin (Vue, options = {}) {
  if (plugin.installed) {
    return
  }
  plugin.installed = true

  options = pick(options, 'dataProjection')
  Object.assign(CircleStyle, options)
  Object.assign(FillStyle, options)
  Object.assign(IconStyle, options)
  Object.assign(RegShapeStyle, options)
  Object.assign(StrokeStyle, options)
  Object.assign(Style, options)
  Object.assign(TextStyle, options)

  Vue.component(CircleStyle.name, CircleStyle)
  Vue.component(FillStyle.name, FillStyle)
  Vue.component(IconStyle.name, IconStyle)
  Vue.component(RegShapeStyle.name, RegShapeStyle)
  Vue.component(StrokeStyle.name, StrokeStyle)
  Vue.component(Style.name, Style)
  Vue.component(TextStyle.name, TextStyle)

  // todo remove in v0.13.x
  Vue.component('VlStyleBox', {
    name: 'VlStyleBox',
    extends: Style,
    created () {
      if (process.env.NODE_ENV !== 'production') {
        this.$logger.warn('VlStyleBox component is deprecated. Use VlStyle component instead.')
      }
    },
  })
}

export default plugin

export {
  plugin as install,
  CircleStyle,
  FillStyle,
  IconStyle,
  RegShapeStyle,
  StrokeStyle,
  Style,
  TextStyle,
}
