import { isEmpty, isFunction, isBoolean, flow, map, filter, get } from 'lodash/fp'
import { geoJson, consts } from 'vl-ol'

export default {
  inject: [ 'view' ],
  provide () {
    return {
      setStyle: ::this.setStyle,
      getStyle: ::this.getStyle
    }
  },
  beforeCreate () {
    /**
     * @type {Style[]|StyleFunction|undefined}
     */
    this.styles = this.defaultStyles = undefined
  },
  methods: {
    /**
     * Returns styleable OpenLayers object
     *
     * @protected
     */
    styleTarget () { },
    setStyle (style) {
      this.styles = style
      const styleTarget = this.styleTarget()

      if (styleTarget) {
        if (this.styles === null || this.styles) {
          styleTarget.setStyle(createStyleFunc(this))
        } else {
          styleTarget.setStyle(undefined)
        }
      }
    },
    getStyle () {
      return this.styles
    }
  }
}

export function createStyleFunc (vm) {
  return function __styleTargetStyleFunc (feature, resolution) {
    if (!feature.getGeometry()) return

    let styles = vm.styles
    let geoJsonFeature = geoJson.write(feature, vm.view.getProjection())
    let layerId = get([ 'properties', consts.LAYER_PROP ], geoJsonFeature)

    if (isFunction(styles)) {
      styles = styles(geoJsonFeature, resolution, layerId)
    } else if (Array.isArray(styles)) {
      styles = flow(
        filter(({ style, condition }) => {
          return condition == null ||
                 (isBoolean(condition) && condition) ||
                 (
                   isFunction(condition) &&
                   condition(geoJsonFeature, resolution, layerId)
                 )
        }),
        map('style')
      )(styles)
    }
    // null style
    if (styles === null || !isEmpty(styles)) return styles

    if (vm.defaultStyles) {
      return isFunction(vm.defaultStyles)
        ? vm.defaultStyles(geoJsonFeature, resolution, layerId)
        : vm.defaultStyles
    }
  }
}
