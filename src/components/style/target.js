import { flow, map, filter } from 'lodash/fp'
import * as geoJson from 'vl-ol/geojson'
import * as styleHelper from 'vl-ol/style'

export default {
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
    let geoJsonFeature = geoJson.writeFeature(feature, vm.view.getProjection())

    if (typeof styles === 'function') {
      styles = styles(geoJsonFeature, resolution, styleHelper)
    } else if (Array.isArray(styles)) {
      styles = flow(
        filter(({ style, condition }) => {
          return condition == null ||
                 (condition === true) ||
                 (
                   typeof condition === 'function' &&
                   condition(geoJsonFeature, resolution)
                 )
        }),
        map('style')
      )(styles)
    }
    // null style
    if (styles === null || styles.length) return styles

    if (vm.defaultStyles) {
      return typeof vm.defaultStyles === 'function'
        ? vm.defaultStyles(geoJsonFeature, resolution, styleHelper)
        : vm.defaultStyles
    }
  }
}
