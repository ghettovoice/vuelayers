import { pick } from '../../util/minilo'
import Circle from './circle.vue'
import Fill from './fill.vue'
import Icon from './icon.vue'
import RegShape from './reg-shape.vue'
import Stroke from './stroke.vue'
import Style from './style.vue'
import Text from './text.vue'

function plugin (Vue, options = {}) {
  if (plugin.installed) {
    return
  }
  plugin.installed = true

  options = pick(options, 'dataProjection')
  Object.assign(Circle, options)
  Object.assign(Fill, options)
  Object.assign(Icon, options)
  Object.assign(RegShape, options)
  Object.assign(Stroke, options)
  Object.assign(Style, options)
  Object.assign(Text, options)

  Vue.component(Circle.name, Circle)
  Vue.component(Fill.name, Fill)
  Vue.component(Icon.name, Icon)
  Vue.component(RegShape.name, RegShape)
  Vue.component(Stroke.name, Stroke)
  Vue.component(Style.name, Style)
  Vue.component(Text.name, Text)
}

export default plugin

export {
  Circle,
  Fill,
  Icon,
  RegShape,
  Stroke,
  Style,
  Text,
  plugin as install,
}
