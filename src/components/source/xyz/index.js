/**
 * @module components/source/xyz
 */
import XYZ from './source.vue'

export default {
  ...XYZ,
  install (Vue) {
    Vue.component(XYZ.name, XYZ)
  }
}
