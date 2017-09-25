import StyleBox from '../style-box'
import { debug } from '../../core'

/**
 * @deprecated
 * @todo remove in the next release
 */
const Style = {
  name: 'vl-style-container',
  extends: StyleBox.Style,
  beforeCreate () {
    debug.warndbg('vl-style-container was renamed to vl-style-box. ' +
      'Name "vl-style-container" now is deprecated and will be removed in the next release.')
  },
}

export default {
  Style,
  install (Vue) {
    Vue.component(Style.name, Style)
  },
}
