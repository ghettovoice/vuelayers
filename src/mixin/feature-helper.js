import { Style } from 'ol/style'
import {
  CIRCLE_SERIALIZE_PROP, createStyle, dumpStyle,
  getFeatureId,
  getFeatureProperties, initializeFeature,
  setFeatureId,
  setFeatureProperties, STYLE_SERIALIZE_PROP,
} from '../ol-ext'
import { get, isArray, isEqual, isFunction, isPlainObject } from '../util/minilo'

export default {
  methods: {
    /**
     * @param {FeatureLike} feature
     * @return {Promise<Feature>}
     * @protected
     */
    async initializeFeature (feature) {
      if (isFunction(feature?.resolveOlObject)) {
        feature = await feature.resolveOlObject()
      } else if (isPlainObject(feature)) {
        feature = this.readFeatureInDataProj(feature)
      }

      return initializeFeature(feature)
    },
    /**
     * @param {module:ol/Feature~Feature} feature
     * @param {module:ol/Feature~Feature} newFeature
     * @protected
     */
    updateFeature (feature, newFeature) {
      const featureJson = this.writeFeatureInDataProj(feature)
      const newFeatureJson = this.writeFeatureInDataProj(newFeature)

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

      let styleJson = get(newFeatureJson, `properties.${STYLE_SERIALIZE_PROP}`) || null
      if (styleJson && !isArray(styleJson)) {
        styleJson = [styleJson]
      }
      let style = null
      if (styleJson) {
        style = styleJson.map(style => createStyle(style, geom => this.readGeometryInDataProj(geom)))
      }
      let currentStyle = feature.getStyle() || null
      if (currentStyle instanceof Style) {
        currentStyle = [currentStyle]
      }
      const currentStyleJson = currentStyle ? currentStyle.map(
        style => dumpStyle(style, geom => this.writeGeometryInDataProj(geom))) : null
      if (!style || !currentStyle || isFunction(currentStyle)) {
        if (style !== currentStyle) {
          feature.setStyle(style)
        }
      } else {
        if (!isEqual(styleJson, currentStyleJson)) {
          feature.setStyle(style)
        }
      }
    },
  },
}
