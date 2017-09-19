/**
 * @module components/overlay
 */
import Overlay from './overlay.vue'

export default {
  Overlay,
  install (Vue) {
    Vue.component(Overlay.name, Overlay)
  },
}
