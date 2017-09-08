/**
 * @module components/style/container
 * @deprecated
 */
import StyleBox from '../box/style.vue'
import { warndbg } from '../../../utils/debug'

/**
 * @deprecated
 * @todo remove in the next release
 */
const Style = {
  name: 'vl-style-container',
  extends: StyleBox,
  beforeCreate () {
    warndbg('vl-style-container was renamed to vl-style-box. ' +
      'Name "vl-style-container" now is deprecated and will be removed in the next release.')
  },
}

export default {
  Style,
  install (Vue) {
    Vue.component(Style.name, Style)
  },
}
