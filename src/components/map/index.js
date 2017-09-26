/**
 * Map module consists of two main components:
 *
 * - Map `vl-map` - container for **layers**, **interactions**, **controls** and **overlays**. It responsible for viewport
 *   rendering and low level interaction events.
 * - View `vl-view` - represents a simple 2D view of the map. This is the component to act upon to change the **center**,
 *   **resolution**, and **rotation** of the map.
 *
 * @module map
 */
import Map from './map.vue'
import View from './view.vue'

export default {
  /**
   * Map `vl-map` component.
   */
  Map,
  /**
   * View `vl-view` component.
   */
  View,
  /**
   * Registers Map and View components with default names.
   * @param {Vue} Vue
   * @return {void}
   */
  install (Vue) {
    Vue.component(Map.name, Map)
    Vue.component(View.name, View)
  },
}
