/**
 * @module map
 */
import Map from './map.vue'
import View from './view.vue'

/**
 * @alias module:map
 *
 * @example Install
 * import Vue from 'vue'
 * // import module and styles
 * import { Map } from 'vuelayers'
 * // or
 * import Map from 'vuelayers/lib/map'
 * // import VueLayers styles
 * import 'vuelayers/lib/style.css'
 * // register vl-map and vl-view components
 * Vue.use(Map)
 *
 * @example Usage [html]
 * <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" style="height: 400px">
 *   <vl-view :center="[0, 0]" :zoom="3" :rotation="0"></vl-view>
 *
 *   <vl-layer-tile>
 *     <vl-source-osm></vl-source-osm>
 *   </vl-layer-tile>
 * </vl-map>
 */
export default {
  /**
   * Container for **layers**, **interactions**, **controls** and **overlays**. It responsible for viewport
   * rendering and low level interaction events.
   * @alias module:map/map
   */
  Map,
  /**
   * Represents a simple **2D view** of the map. This is the component to act upon to change the **center**,
   * **resolution**, and **rotation** of the map.
   * @alias module:map/map
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
