import Vue from 'vue'
import uuid from 'uuid/v4'
import { isPlainObject } from 'lodash/fp'
import { EPSG_4326, geoJson } from '../../ol-ext'
import source from './source'
import * as assert from '../../utils/assert'

// todo add support of format, url and default xhr loader
const props = {
  projection: {
    type: String,
    default: EPSG_4326
  },
  useSpatialIndex: {
    type: Boolean,
    default: true
  }
}

const methods = {
  /**
   * @param {Array<(ol.Feature|Vue|GeoJSONFeature)>} features
   * @return {void}
   */
  addFeatures (features) {
    features.forEach(this.addFeature)
  },
  /**
   * @param {ol.Feature|Vue|GeoJSONFeature} feature
   * @return {void}
   */
  addFeature (feature) {
    assert.hasView(this)
    assert.hasSource(this)

    if (feature instanceof Vue) {
      feature = feature.$feature
    } else if (isPlainObject(feature)) {
      feature = geoJson.readFeature(feature, this.$view.getProjection())
    }
    if (feature.getId() == null) {
      feature.setId(uuid())
    }
    this.$source.addFeature(feature)
  },
  /**
   * @param {Array<(ol.Feature|Vue|GeoJSONFeature)>} features
   * @return {void}
   */
  removeFeatures (features) {
    features.forEach(this.removeFeature)
  },
  /**
   * @param {ol.Feature|Vue|GeoJSONFeature} feature
   * @return {void}
   */
  removeFeature (feature) {
    assert.hasSource(this)

    if (feature instanceof Vue) {
      feature = feature.$feature
    } else if (isPlainObject(feature)) {
      feature = this.$source.getFeatureById(feature.id)
    }
    this.$source.removeFeature(feature)
  },
  /**
   * @return {void}
   */
  clear () {
    assert.hasSource(this)
    this.$source.clear()
  },
  /**
   * @param {string|number} id
   * @return {ol.Feature|undefined}
   */
  getFeatureById (id) {
    assert.hasSource(this)

    return this.$source.getFeatureById(id)
  },
  /**
   * @return {Promise}
   * @protected
   */
  init () {
    return this::source.methods.init()
  },
  /**
   * @return {void|Promise<void>}
   * @protected
   */
  deinit () {
    return this::source.methods.deinit()
  },
  /**
   * @return {void}
   * @protected
   */
  mount () {
    this::source.methods.mount()
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    this::source.methods.unmount()
  }
}

export default {
  mixins: [source],
  props,
  methods,
  stubVNode: {
    empty: false,
    attrs () {
      return {
        class: this.$options.name
      }
    }
  }
}
