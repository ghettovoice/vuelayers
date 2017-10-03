/**
 * @module map
 */
import Map from './map.vue'
import View from './view.vue'

/**
 * Map module consists of two main components:
 *
 * - {@link module:map/map|Map `vl-map`} - viewport, map rendering and low level interactions.
 * - {@link module:map/map|View `vl-view`} - 2D view of the map
 *
 * @example **Install**
 * ```js
 * import Vue from 'vue'
 * // import module and styles
 * import { Map } from 'vuelayers'
 * // or
 * import Map from 'vuelayers/lib/map'
 * // import VueLayers styles
 * import 'vuelayers/lib/style.css'
 * // register vl-map and vl-view components
 * Vue.use(Map)
 * ```
 * @example **Usage**
 * ```html
 * <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true">
 *   <vl-view :center="[0, 0]" :zoom="3" :rotation="0"></vl-view>
 *
 *   <vl-layer-tile>
 *     <vl-source-osm></vl-source-osm>
 *   </vl-layer-tile>
 * </vl-map>
 * ```
 */
export default {
  /**
   * Container for **layers**, **interactions**, **controls** and **overlays**. It responsible for viewport
   * rendering and low level interaction events.
   *
   * @see {@link module:map/map}
   */
  Map,
  /**
   * Represents a simple **2D view** of the map. This is the component to act upon to change the **center**,
   * **resolution**, and **rotation** of the map.
   *
   * @see {@link module:map/view}
   */
  View,
  /**
   * Registers Map and View components with default names.
   *
   * @param {Vue} Vue
   * @return {void}
   */
  install (Vue) {
    Vue.component(Map.name, Map)
    Vue.component(View.name, View)
  },
}
