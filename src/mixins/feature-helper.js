import {
  CIRCLE_SERIALIZE_PROP,
  getFeatureId,
  getFeatureProperties,
  initializeFeature,
  setFeatureId,
  setFeatureProperties,
  STYLE_SERIALIZE_PROP,
} from '../ol-ext'
import { get, isEqual, isFunction, isPlainObject } from '../utils'

export default {
  methods: {
    /**
     * @param {FeatureLike} feature
     * @param {boolean} [viewProj=false]
     * @return {Feature}
     * @protected
     */
    initializeFeature (feature, viewProj = false) {
      feature = feature?.$feature || feature
      if (isPlainObject(feature)) {
        if (viewProj) {
          feature = this.readFeatureInViewProj(feature)
        } else {
          feature = this.readFeatureInDataProj(feature)
        }
      }

      return initializeFeature(feature)
    },
    /**
     * @param {module:ol/Feature~Feature} feature
     * @param {module:ol/Feature~Feature} newFeature
     * @protected
     */
    updateFeature (feature, newFeature) {
      if (this.$mapVm?.isInteracting()) return

      const featureJson = this.writeFeatureInViewProj(feature)
      const newFeatureJson = this.writeFeatureInViewProj(newFeature)

      if (isEqual(featureJson, newFeatureJson)) return

      if (getFeatureId(feature) !== getFeatureId(newFeature)) {
        setFeatureId(feature, getFeatureId(newFeature))
      }

      const properties = getFeatureProperties(newFeature)
      const currentProperties = getFeatureProperties(feature)
      if (!isEqual(properties, currentProperties)) {
        setFeatureProperties(feature, properties)
      }

      const geomJson = get(newFeatureJson, `properties.${CIRCLE_SERIALIZE_PROP}`) || newFeatureJson.geometry || null
      const currentGeomJson = get(featureJson, `properties.${CIRCLE_SERIALIZE_PROP}`) || featureJson.geometry || null
      if (!isEqual(geomJson, currentGeomJson)) {
        feature.setGeometry(newFeature.getGeometry() || null)
      }

      const style = newFeature.getStyle()
      const currentStyle = feature.getStyle()
      if (isFunction(currentStyle) && isFunction(style)) {
        if (currentStyle !== style) {
          feature.setStyle(style)
        }
      } else if (isFunction(style)) {
        feature.setStyle(style)
      }

      const styleJson = get(newFeatureJson, `properties.${STYLE_SERIALIZE_PROP}`) || null
      const currentStyleJson = get(featureJson, `properties.${STYLE_SERIALIZE_PROP}`) || null
      if (!isEqual(styleJson, currentStyleJson)) {
        feature.setStyle(style)
      }
    },
  },
}
