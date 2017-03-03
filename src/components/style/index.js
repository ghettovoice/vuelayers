import style from './style'
import styleImage from './image'
import styleTarget from './target'

import styleFunc from './func'

export VlStyleContainer from './container'
export VlStyleFill from './fill'
export VlStyleStroke from './stroke'
export VlStyleCircle from './circle'
export VlStyleIcon from './icon'

export const mixins = {
  style,
  styleImage,
  styleTarget
}

export const directives = {
  styleFunc
}
