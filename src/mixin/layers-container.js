import BaseLayer from 'ol/layer/base'
import Vue from 'vue'
import { instanceOf } from '../util/assert'

const methods = {
  /**
   * @return {IndexedCollectionAdapter}
   * @protected
   */
  getLayersTarget () {
    throw new Error('Not implemented method')
  },
  /**
   * @param {ol.layer.Layer|Vue} layer
   * @return {void}
   */
  addLayer (layer) {
    layer = layer instanceof Vue ? layer.$layer : layer
    instanceOf(layer, BaseLayer)

    if (this.getLayersTarget().has(layer) === false) {
      this.getLayersTarget().add(layer)
    }
  },
  /**
   * @param {ol.layer.Layer|Vue} layer
   * @return {void}
   */
  removeLayer (layer) {
    layer = layer instanceof Vue ? layer.$layer : layer

    if (!layer) return

    if (this.getLayersTarget().has(layer)) {
      this.getLayersTarget().remove(layer)
    }
  },
  /**
   * @return {ol.layer.Layer[]}
   */
  getLayers () {
    return this.getLayersTarget().elements
  },
  /**
   * @param {string|number} id
   * @return {ol.layer.Layer|undefined}
   */
  getLayerById (id) {
    return this.getLayersTarget().findByKey(id)
  },
  /**
   * @return {void}
   */
  clearLayers () {
    this.getLayersTarget().clear()
  },
  /**
   * @returns {Object}
   * @protected
   */
  getServices () {
    const vm = this

    return {
      get layersContainer () { return vm },
    }
  },
}

export default {
  methods,
  destroyed () {
    this.clearLayers()
  },
}
